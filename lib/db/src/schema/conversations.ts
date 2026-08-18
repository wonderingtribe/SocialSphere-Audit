import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { leadsTable } from "./leads";

/**
 * Conversations table.
 *
 * Extends the public `Conversation` shape with the approval-first workflow
 * fields (`replyStatus`, `replyText`, `sentAt`). `replyStatus` lifecycle:
 * "pending" → "approved" → "sent". A reply is only ever marked "sent" after
 * the connected platform adapter confirms delivery through an official API.
 */
export const conversationsTable = pgTable("conversations", {
  id: text("id").primaryKey(),
  leadId: text("lead_id")
    .notNull()
    .references(() => leadsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  username: text("username").notNull(),
  platform: text("platform").notNull(),
  preview: text("preview").notNull(),
  intent: text("intent").notNull(),
  sentiment: text("sentiment").notNull(),
  status: text("status").notNull().default("Needs approval"),
  suggestion: text("suggestion").notNull(),
  mode: text("mode").notNull(),
  replyText: text("reply_text"),
  replyStatus: text("reply_status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ConversationRow = typeof conversationsTable.$inferSelect;
export type InsertConversation = typeof conversationsTable.$inferInsert;