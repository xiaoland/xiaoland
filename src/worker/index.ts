import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../worker/env";
import { createDb } from "../db";
import authApp from "./auth";

const app = new Hono<AppEnv>().basePath("/api");

function corsOrigin(origin: string): string {
  if (origin === "https://lanzhijiang.dev") {
    return origin;
  }

  try {
    const hostname = new URL(origin).hostname;
    if (
      hostname === "xiaoland.pages.dev" ||
      hostname.endsWith(".xiaoland.pages.dev")
    ) {
      return origin;
    }
  } catch {
    return "https://lanzhijiang.dev";
  }

  return "https://lanzhijiang.dev";
}

// use cors, secureHeaders, logger
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "HX-Current-URL",
      "HX-Request",
      "HX-Target",
      "HX-Trigger",
      "HX-Trigger-Name",
    ],
  }),
);
app.use("*", secureHeaders());

// use db
app.use(
  "*",
  createMiddleware<AppEnv>(async (c, next) => {
    c.set("db", createDb(c.env.DB));
    await next();
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authApp);

export default app;
