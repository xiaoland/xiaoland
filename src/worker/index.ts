import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "../db";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api");

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

app.get("/health", (c) => c.json({ ok: true }));

export default app;
