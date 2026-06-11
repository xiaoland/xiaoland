import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const xenix_download_users = sqliteTable("xenix_download_users", {
  email: text("email").notNull().unique(),
  phone: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});
export type InsertUser = typeof xenix_download_users.$inferInsert;
export type SelectUser = typeof xenix_download_users.$inferSelect;
