import { pgTable, jsonb, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Incoming webhook events received from connected platforms.
 *
 * Every event is stored verbatim with the platform that produced it. Rows are
 * only ever written by the webhook receiver after the platform verification
 * challenge has passed — they are REAL platform data and should drive lead
 * creation/advancement when adapters consume them.
 */
export const webhookEventsTable = pgTable("webhook_events", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WebhookEventRow = typeof webhookEventsTable.$inferSelect;
export type InsertWebhookEvent = typeof webhookEventsTable.$inferInsert;