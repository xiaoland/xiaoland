import { Hono } from "hono";
import { cors } from "hono/cors";
import { createDb } from "../db";
import { getComments } from "../services/comment";
import { articleComment } from "../templates/sections/article-comment";
import {
  xenixDownloadError,
  xenixDownloadReady,
} from "../templates/sections/xenix-download";

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>().basePath("/api");

const XENIX_DOWNLOAD_URL = "https://r2.lanzhijiang.dev/xenix-latest.zip";

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

app.post("/xenix/download", async (c) => {
  const form = await c.req.formData().catch(() => null);
  const contact = form?.get("contact");

  if (typeof contact !== "string" || contact.trim().length === 0) {
    return c.html(xenixDownloadError("请先填写邮箱或手机号。"));
  }

  return c.html(xenixDownloadReady(XENIX_DOWNLOAD_URL));
});
app.get("/fragments/article-comments/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);
  const comments = await getComments(slug, db).catch((error) => {
    console.warn(`Failed to load comments for ${slug}`, error);
    return [];
  });

  if (!comments.length) {
    return c.html(`<p>No comments yet.</p>`);
  }

  return c.html(
    comments
      .map((comment) =>
        articleComment({
          sentByAvatar: "",
          sentByNickname: comment.sentBy,
          commentContent: comment.content,
          commentCreatedAt: comment.createdAt?.toISOString() ?? "",
        }),
      )
      .join("\n"),
  );
});

export default app;
