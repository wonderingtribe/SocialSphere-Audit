/**
 * Seeds the SocialSphere workspace database with the demo dataset.
 *
 * Demo records are labeled DEMO (product guardrail) and are upserted
 * idempotently — safe to run repeatedly. Requires DATABASE_URL.
 *
 *   pnpm --filter @workspace/scripts run seed
 */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb, isDbConfigured } from "@workspace/db";
import {
  conversationsTable,
  integrationsTable,
  leadsTable,
  subscriptionsTable,
} from "@workspace/db";
import { demoConversations, demoIntegrations, demoLeads } from "../../artifacts/api-server/src/data/demoData";

export async function seedWorkspaceDatabase(): Promise<void> {
  if (!isDbConfigured) {
    throw new Error("DATABASE_URL must be set before seeding.");
  }

  const db = getDb();
  console.log("Seeding SocialSphere workspace database…");

  const integrationResult = await db
    .insert(integrationsTable)
    .values(
      demoIntegrations.map((integration) => ({
        id: integration.id,
        name: integration.name,
        description: integration.description,
        icon: integration.icon,
        connected: integration.connected,
      })),
    )
    .onConflictDoNothing();
  console.log(`Integrations: ${integrationResult.rowCount ?? 0} inserted`);

  const leadResult = await db
    .insert(leadsTable)
    .values(
      demoLeads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        username: lead.username,
        platform: lead.platform,
        source: lead.source,
        campaign: lead.campaign,
        interaction: lead.interaction,
        history: lead.history,
        leadScore: lead.leadScore,
        intentScore: lead.intentScore,
        status: lead.status,
        tags: lead.tags,
        notes: lead.notes,
        lastInteraction: lead.lastInteraction,
        nextFollowUp: lead.nextFollowUp,
        conversionStatus: lead.conversionStatus,
        mode: lead.mode,
      })),
    )
    .onConflictDoNothing();
  console.log(`Leads: ${leadResult.rowCount ?? 0} inserted`);

  const conversationResult = await db
    .insert(conversationsTable)
    .values(
      demoConversations.map((conversation) => ({
        id: conversation.id,
        leadId: conversation.leadId,
        name: conversation.name,
        username: conversation.username,
        platform: conversation.platform,
        preview: conversation.preview,
        intent: conversation.intent,
        sentiment: conversation.sentiment,
        status: conversation.status,
        suggestion: conversation.suggestion,
        mode: conversation.mode,
      })),
    )
    .onConflictDoNothing();
  console.log(`Conversations: ${conversationResult.rowCount ?? 0} inserted`);

  const [subscription] = await db.select().from(subscriptionsTable).limit(1);
  if (!subscription) {
    await db.insert(subscriptionsTable).values({
      stripeCustomerId: "local-demo",
      plan: "free",
      status: "inactive",
    });
    console.log("Subscriptions: 1 workspace row created");
  }

  console.log("Seed complete.");
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  seedWorkspaceDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}