import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey(),
  sentBy: text("sent_by").notNull(),
  articleId: text("article_id").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type InsertComment = typeof comments.$inferInsert;
export type SelectComment = typeof comments.$inferSelect;
