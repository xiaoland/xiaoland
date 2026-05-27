import * as schema from "../db/schema";
import { drizzle } from "drizzle-orm/d1";
import { DrizzleD1Database } from "drizzle-orm/d1";

export type DB = DrizzleD1Database<typeof schema>;

export function createDb(database: D1Database): DB {
  return drizzle(database, { schema });
}
