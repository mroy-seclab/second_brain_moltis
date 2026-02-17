import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  type: text("type", {
    enum: ["note", "conversation", "task", "bookmark", "snippet"],
  }).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>().default({}),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  source_path: text("source_path"),
  content_hash: text("content_hash"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
