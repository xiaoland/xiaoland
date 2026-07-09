import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "../db/schema";

export type Bindings = {
  DB: D1Database;

  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  APP_ORIGIN: string;
};

export type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId?: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
