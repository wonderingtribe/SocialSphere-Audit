import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Subscriptions table (Stripe billing).
 *
 * Tracks the workspace's current plan and the Stripe objects that back it.
 * Rows are created/updated by the billing routes and the Stripe webhook.
 */
export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("inactive"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type SubscriptionRow = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;