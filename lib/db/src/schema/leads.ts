import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Leads table.
 *
 * Mirrors the public API `Lead` shape (see lib/api-spec/openapi.yaml) so the
 * server can map records to responses without data gymnastics. Field values
 * match the real `REAL|DEMO|NOT_CONNECTED` contract — no record may be labeled
 * REAL unless it originated from a verified platform event.
 */
export const leadsTable = pgTable("leads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull(),
  platform: text("platform").notNull(),
  source: text("source").notNull(),
  campaign: text("campaign").notNull(),
  interaction: text("interaction").notNull(),
  history: text("history").notNull(),
  leadScore: integer("lead_score").notNull(),
  intentScore: integer("intent_score").notNull(),
  status: text("status").notNull(),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  notes: text("notes").notNull(),
  lastInteraction: text("last_interaction").notNull(),
  nextFollowUp: text("next_follow_up").notNull(),
  conversionStatus: text("conversion_status").notNull(),
  mode: text("mode").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LeadRow = typeof leadsTable.$inferSelect;
export type InsertLead = typeof leadsTable.$inferInsert;