import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  uuid: text("uuid").primaryKey(),
  nickname: text("nickname").notNull(),
  avatarUrl: text("avatar_url"),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

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

export * from "./xenix";
