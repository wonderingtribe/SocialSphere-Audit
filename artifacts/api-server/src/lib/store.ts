import crypto from "node:crypto";
import { sql } from "drizzle-orm";
import { isDbConfigured, getDb } from "@workspace/db";
import {
  conversationsTable,
  integrationsTable,
  leadsTable,
  webhookEventsTable,
  webhookSettingsTable,
} from "@workspace/db";
import type { Conversation, Integration, Lead, LeadStatus } from "@workspace/api-zod";
import {
  advanceDemoLead,
  demoConversations,
  demoIntegrations,
  demoLeads,
} from "../data/demoData";

/**
 * Data store interface backed by PostgreSQL via Drizzle, with an in-memory
 * fallback so the server keeps running when DATABASE_URL is not configured.
 *
 * Demo records are always labeled `DEMO` (product guardrail). Real platform
 * events will write REAL rows once integrations are connected.
 */

export type DeliveryResult = "requires_connection" | "queued";

export interface ApproveResult {
  conversation: Conversation;
  delivery: DeliveryResult;
}

export interface Store {
  readonly mode: "postgres" | "memory";
  listLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  advanceLead(id: string): Promise<Lead | null>;
  listConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  approveConversation(
    id: string,
    replyText: string,
  ): Promise<ApproveResult | null>;
  listIntegrations(): Promise<Integration[]>;
  setConnection(
    id: string,
    connectionUrl: string,
  ): Promise<Integration | undefined>;
  getWebhookToken(platform: string): Promise<string>;
  recordWebhookEvent(
    platform: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void>;
  listWebhookEvents(platform?: string): Promise<
    Array<{ id: number; platform: string; eventType: string; receivedAt: Date }>
  >;
}

const toLead = (row: {
  id: string;
  name: string;
  username: string;
  platform: string;
  source: string;
  campaign: string;
  interaction: string;
  history: string;
  leadScore: number;
  intentScore: number;
  status: string;
  tags: string[];
  notes: string;
  lastInteraction: string;
  nextFollowUp: string;
  conversionStatus: string;
  mode: string;
}): Lead => ({
  id: row.id,
  name: row.name,
  username: row.username,
  platform: row.platform,
  source: row.source,
  campaign: row.campaign,
  interaction: row.interaction,
  history: row.history,
  leadScore: row.leadScore,
  intentScore: row.intentScore,
  status: row.status as LeadStatus,
  tags: row.tags,
  notes: row.notes,
  lastInteraction: row.lastInteraction,
  nextFollowUp: row.nextFollowUp,
  conversionStatus: row.conversionStatus,
  mode: row.mode as Lead["mode"],
});

const toConversation = (row: {
  id: string;
  leadId: string;
  name: string;
  username: string;
  platform: string;
  preview: string;
  intent: string;
  sentiment: string;
  status: string;
  suggestion: string;
  mode: string;
  replyText: string | null;
  replyStatus: string | null;
  sentAt: Date | null;
}): Conversation => ({
  id: row.id,
  leadId: row.leadId,
  name: row.name,
  username: row.username,
  platform: row.platform,
  preview: row.preview,
  intent: row.intent,
  sentiment: row.sentiment,
  status: row.status,
  suggestion: row.suggestion,
  mode: row.mode as Conversation["mode"],
  ...(row.replyText ? { replyText: row.replyText } : {}),
  ...(row.replyStatus ? { replyStatus: row.replyStatus as "pending" | "approved" | "sent" } : {}),
});

const toIntegration = (row: {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
}): Integration => ({
  id: row.id,
  name: row.name,
  description: row.description,
  icon: row.icon,
  connected: row.connected,
});

export function advanceStatus(lead: Lead): Lead | null {
  return advanceDemoLead(lead);
}

async function createPostgresStore(): Promise<Store> {
  const db = getDb();

  const seedIfEmpty = async () => {
    const integrationCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(integrationsTable);
    const leadCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(leadsTable);
    const conversationCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(conversationsTable);

    if (Number(integrationCount[0]?.count ?? 0) === 0) {
      await db.insert(integrationsTable).values(
        demoIntegrations.map((integration) => ({
          id: integration.id,
          name: integration.name,
          description: integration.description,
          icon: integration.icon,
          connected: integration.connected,
        })),
      );
    }
    if (Number(leadCount[0]?.count ?? 0) === 0) {
      await db.insert(leadsTable).values(
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
      );
    }
    if (Number(conversationCount[0]?.count ?? 0) === 0) {
      await db.insert(conversationsTable).values(
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
      );
    }
  };

  return {
    mode: "postgres" as const,
    async listLeads() {
      await seedIfEmpty();
      const rows = await db.select().from(leadsTable).orderBy(leadsTable.id);
      return rows.map(toLead);
    },
    async getLead(id) {
      const [row] = await db.select().from(leadsTable).where(sql`${leadsTable.id} = ${id}`);
      return row ? toLead(row) : undefined;
    },
    async advanceLead(id) {
      const [row] = await db.select().from(leadsTable).where(sql`${leadsTable.id} = ${id}`);
      if (!row) return null;
      const lead = toLead(row);
      const advanced = advanceDemoLead(lead);
      if (!advanced) return null;
      await db
        .update(leadsTable)
        .set({ status: advanced.status, updatedAt: new Date() })
        .where(sql`${leadsTable.id} = ${id}`);
      return advanced;
    },
    async listConversations() {
      await seedIfEmpty();
      const rows = await db
        .select()
        .from(conversationsTable)
        .orderBy(conversationsTable.id);
      return rows.map(toConversation);
    },
    async getConversation(id) {
      const [row] = await db
        .select()
        .from(conversationsTable)
        .where(sql`${conversationsTable.id} = ${id}`);
      return row ? toConversation(row) : undefined;
    },
    async approveConversation(id, replyText) {
      const [row] = await db
        .select()
        .from(conversationsTable)
        .where(sql`${conversationsTable.id} = ${id}`);
      if (!row) return null;

      const [integrationRow] = await db
        .select()
        .from(integrationsTable)
        .where(sql`${integrationsTable.id} = ${row.platform.toLowerCase()}`);

      const connected = Boolean(integrationRow?.connected);
      const [updated] = await db
        .update(conversationsTable)
        .set({
          replyText,
          replyStatus: "approved",
          status: "Approved — awaiting platform send",
          updatedAt: new Date(),
        })
        .where(sql`${conversationsTable.id} = ${id}`)
        .returning();

      return {
        conversation: toConversation(updated),
        delivery: connected ? "queued" : "requires_connection",
      };
    },
    async listIntegrations() {
      await seedIfEmpty();
      const rows = await db
        .select()
        .from(integrationsTable)
        .orderBy(integrationsTable.id);
      return rows.map(toIntegration);
    },
    async setConnection(id, connectionUrl) {
      await db
        .update(integrationsTable)
        .set({ connectionUrl, updatedAt: new Date() })
        .where(sql`${integrationsTable.id} = ${id}`);
      const [row] = await db
        .select()
        .from(integrationsTable)
        .where(sql`${integrationsTable.id} = ${id}`);
      return row ? toIntegration(row) : undefined;
    },
    async getWebhookToken(platform) {
      const envToken = process.env.WEBHOOK_VERIFY_TOKEN?.trim();
      if (envToken) return envToken;

      const [existing] = await db
        .select()
        .from(webhookSettingsTable)
        .where(sql`${webhookSettingsTable.platform} = ${platform}`);
      if (existing) return existing.verifyToken;

      const token = crypto.randomBytes(24).toString("hex");
      await db
        .insert(webhookSettingsTable)
        .values({ platform, verifyToken: token, callbackUrl: `pending:${platform}` })
        .onConflictDoNothing();
      return token;
    },
    async recordWebhookEvent(platform, eventType, payload) {
      await db.insert(webhookEventsTable).values({ platform, eventType, payload });
    },
    async listWebhookEvents(platform) {
      const rows = platform
        ? await db
            .select({
              id: webhookEventsTable.id,
              platform: webhookEventsTable.platform,
              eventType: webhookEventsTable.eventType,
              receivedAt: webhookEventsTable.receivedAt,
            })
            .from(webhookEventsTable)
            .where(sql`${webhookEventsTable.platform} = ${platform}`)
            .orderBy(sql`${webhookEventsTable.id} DESC`)
            .limit(50)
        : await db
            .select({
              id: webhookEventsTable.id,
              platform: webhookEventsTable.platform,
              eventType: webhookEventsTable.eventType,
              receivedAt: webhookEventsTable.receivedAt,
            })
            .from(webhookEventsTable)
            .orderBy(sql`${webhookEventsTable.id} DESC`)
            .limit(50);
      return rows.map((row) => ({
        id: row.id,
        platform: row.platform,
        eventType: row.eventType,
        receivedAt: row.receivedAt,
      }));
    },
  };
}

function createMemoryStore(): Store {
  const leads: Lead[] = [...demoLeads];
  const conversations: Conversation[] = demoConversations.map((conversation) => ({
    ...conversation,
  }));
  const integrations: Integration[] = demoIntegrations.map((integration) => ({
    ...integration,
  }));
  const webhookTokens = new Map<string, string>();
  const webhookEvents: Array<{
    id: number;
    platform: string;
    eventType: string;
    receivedAt: Date;
  }> = [];
  let webhookEventId = 0;

  return {
    mode: "memory" as const,
    async listLeads() {
      return leads;
    },
    async getLead(id) {
      return leads.find((lead) => lead.id === id);
    },
    async advanceLead(id) {
      const index = leads.findIndex((lead) => lead.id === id);
      if (index === -1) return null;
      const advanced = advanceDemoLead(leads[index]);
      if (!advanced) return null;
      leads[index] = advanced;
      return advanced;
    },
    async listConversations() {
      return conversations;
    },
    async getConversation(id) {
      return conversations.find((conversation) => conversation.id === id);
    },
    async approveConversation(id, replyText) {
      const conversation = conversations.find((candidate) => candidate.id === id);
      if (!conversation) return null;
      const integration = integrations.find(
        (candidate) => candidate.id === conversation.platform.toLowerCase(),
      );
      const connected = integration?.connected === true;
      conversation.replyText = replyText;
      conversation.replyStatus = "approved";
      conversation.status = "Approved — awaiting platform send";
      return {
        conversation: { ...conversation },
        delivery: connected ? "queued" : "requires_connection",
      };
    },
    async listIntegrations() {
      return integrations;
    },
    async setConnection(id, connectionUrl) {
      const integration = integrations.find((candidate) => candidate.id === id);
      if (!integration) return undefined;
      integration.connectionUrl = connectionUrl;
      return { ...integration };
    },
    async getWebhookToken(platform) {
      const envToken = process.env.WEBHOOK_VERIFY_TOKEN?.trim();
      if (envToken) return envToken;
      const existing = webhookTokens.get(platform);
      if (existing) return existing;
      const token = crypto.randomBytes(24).toString("hex");
      webhookTokens.set(platform, token);
      return token;
    },
    async recordWebhookEvent(platform, eventType, payload) {
      void payload;
      webhookEvents.push({
        id: ++webhookEventId,
        platform,
        eventType,
        receivedAt: new Date(),
      });
    },
    async listWebhookEvents(platform) {
      return platform
        ? webhookEvents.filter((event) => event.platform === platform).slice(0, 50)
        : webhookEvents.slice(0, 50);
    },
  };
}

export async function createStore(): Promise<Store> {
  if (isDbConfigured) return createPostgresStore();
  return createMemoryStore();
}

let storePromise: Promise<Store> | null = null;

/** Lazily creates the store once; every route shares the same instance. */
export function getStore(): Promise<Store> {
  if (!storePromise) {
    storePromise = createStore();
  }
  return storePromise;
}