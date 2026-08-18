import { Router, type IRouter, type Request, type Response } from "express";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";
import Stripe from "stripe";
import { getDb, isDbConfigured } from "@workspace/db";
import { subscriptionsTable } from "@workspace/db";

const router: IRouter = Router();

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }
  return stripeClient;
}

const PLANS = {
  starter: { amount: 2900, name: "Starter" },
  pro: { amount: 8900, name: "Pro" },
} as const;

async function getOrCreateWorkspaceSubscription() {
  const db = getDb();
  const [existing] = await db.select().from(subscriptionsTable).limit(1);
  if (existing) return existing;

  const customer = await getStripe().customers.create({
    description: "SocialSphere workspace",
  });
  const [created] = await db
    .insert(subscriptionsTable)
    .values({
      stripeCustomerId: customer.id,
      plan: "free",
      status: "inactive",
    })
    .returning();
  return created;
}

/**
 * Current subscription status. Without Stripe credentials this still reports
 * the workspace's local plan state so the UI degrades gracefully.
 */
router.get("/subscription", async (_req, res) => {
  if (!isDbConfigured) {
    res.json({ plan: "free", status: "inactive", stripeConfigured: stripeEnabled() });
    return;
  }
  const subscription = await getOrCreateWorkspaceSubscription();
  res.json({
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    stripeConfigured: stripeEnabled(),
  });
});

const checkoutBody = z.object({
  plan: z.enum(["starter", "pro"]),
});

router.post("/checkout", async (req, res) => {
  if (!stripeEnabled()) {
    res.status(503).json({
      error: "Stripe is not configured — set STRIPE_SECRET_KEY to enable billing",
    });
    return;
  }
  if (!isDbConfigured) {
    res.status(503).json({
      error: "A database is required for billing — set DATABASE_URL to enable billing",
    });
    return;
  }

  const parsed = checkoutBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Choose a valid plan (starter or pro)" });
    return;
  }

  const plan = PLANS[parsed.data.plan];
  const subscription = await getOrCreateWorkspaceSubscription();
  const stripe = getStripe();

  const product = await stripe.products.create({
    name: `SocialSphere ${plan.name}`,
    metadata: { plan: parsed.data.plan },
  });
  const price = await stripe.prices.create({
    unit_amount: plan.amount,
    currency: "usd",
    recurring: { interval: "month" },
    product: product.id,
  });

  const origin =
    typeof req.headers.origin === "string"
      ? req.headers.origin
      : "http://localhost:5000";

  const session = await stripe.checkout.sessions.create({
    customer: subscription.stripeCustomerId,
    line_items: [{ price: price.id, quantity: 1 }],
    mode: "subscription",
    success_url: `${origin}/billing?status=success`,
    cancel_url: `${origin}/billing?status=cancelled`,
    metadata: { plan: parsed.data.plan },
  });

  res.json({ url: session.url });
});

/**
 * Stripe subscription-webhook endpoint. Verifies the signature and keeps the
 * local subscription row in sync with Stripe's source of truth.
 */
router.post("/webhook", async (req: Request, res: Response) => {
  if (!stripeEnabled()) {
    res.status(503).json({ error: "Stripe is not configured" });
    return;
  }
  if (!isDbConfigured) {
    res.status(503).json({ error: "A database is required for billing" });
    return;
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: "Missing webhook signature" });
    return;
  }

  // Use the exact bytes Stripe sent (captured by app.ts before JSON parsing)
  // so signature verification passes.
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  const payload =
    rawBody ??
    (typeof req.body === "string" ? req.body : JSON.stringify(req.body));
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  const db = getDb();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      customer: string;
      subscription?: string;
    };
    await db
      .update(subscriptionsTable)
      .set({
        stripeSubscriptionId: session.subscription ?? null,
        status: "active",
        updatedAt: new Date(),
      })
      .where(sql`${subscriptionsTable.stripeCustomerId} = ${session.customer}`);
  } else if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as {
      id: string;
      status: string;
      current_period_end: number;
    };
    await db
      .update(subscriptionsTable)
      .set({
        status:
          event.type === "customer.subscription.deleted"
            ? "canceled"
            : subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(sql`${subscriptionsTable.stripeSubscriptionId} = ${subscription.id}`);
  }

  res.json({ received: true });
});

export default router;