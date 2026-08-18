import { sql } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Integrations catalog + connection state.
 *
 * One row per supported social platform. `connected` is only ever flipped to
 * true by the OAuth callback flow after the platform returns a valid token —
 * never fabricated by the client. `connectionUrl` holds the last generated
 * official OAuth authorization URL (or null when client credentials are not
 * configured).
 */
export const integrationsTable = pgTable("integrations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  connected: boolean("connected").notNull().default(false),
  connectionUrl: text("connection_url"),
  connectedAccount: text("connected_account"),
  scopes: text("scopes")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  connectedAt: timestamp("connected_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type IntegrationRow = typeof integrationsTable.$inferSelect;
export type InsertIntegration = typeof integrationsTable.$inferInsert;