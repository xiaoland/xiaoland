import { drizzle } from "drizzle-orm/d1";
import { comments } from "./schema";
import type { D1Database } from "@cloudflare/workers-types";

export function createDb(d1: D1Database) {
    return drizzle(d1, { schema: { comments } });
}

export type Db = ReturnType<typeof createDb>;