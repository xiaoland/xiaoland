import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const xenix_download_users = sqliteTable(
  "xenix_download_users",
  {
    email: text("email").unique(),
    phone: text("phone").unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => [
    check(
      "xenix_download_users_contact_check",
      sql`${table.email} is not null or ${table.phone} is not null`,
    ),
  ],
);
export type InsertXenixDownloadUser = typeof xenix_download_users.$inferInsert;
export type SelectXenixDownloadUser = typeof xenix_download_users.$inferSelect;
