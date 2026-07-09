import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  uuid: text("uuid").primaryKey(),
  github_openid: text("github_openid").unique(),
  nickname: text("nickname").notNull(),
  avatarUrl: text("avatar_url"),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
