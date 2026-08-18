import { pgTable, serial, jsonb, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Webhook verification settings per platform.
 *
 * Platforms such as Instagram and Facebook require you to register a callback
 * URL in their developer dashboard and to answer a verification challenge.
 * This table stores the per-platform verify token so the receiver can prove
 * ownership, plus the callback URL the business should paste into the
 * platform's dashboard.
 */
export const webhookSettingsTable = pgTable("webhook_settings", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull().unique(),
  verifyToken: text("verify_token").notNull(),
  callbackUrl: text("callback_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WebhookSettingRow = typeof webhookSettingsTable.$inferSelect;
export type InsertWebhookSetting = typeof webhookSettingsTable.$inferInsert;