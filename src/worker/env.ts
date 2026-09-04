import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "../db/schema";

export type Bindings = {
  DB: D1Database;
  APP_ORIGIN: string;

  // Auth
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  // Calendar
  CALENDAR_USERNAME: string;
  CALENDAR_PASSWORD: string;
  CALENDAR_URL: string;
  CALENDAR_PUBLIC: string; // a list of calendar names split by comma

  CALENDAR_TIMEZONE: string;
};

export type Variables = {
  db: DrizzleD1Database<typeof schema>;
  userId?: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
