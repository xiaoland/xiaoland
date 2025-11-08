import { Hono } from "hono";
import { createDb } from "../db";
import { comments } from "../db/schema";
import type { D1Database } from "@cloudflare/workers-types";

const commentApp = new Hono<{ Bindings: { DB: D1Database } }>();

// API routes for comments
commentApp.get("/comments/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);

  const comments = await db.query.comments.findMany({
    where: (comments, { eq }) => eq(comments.articleSlug, slug),
    orderBy: (comments, { desc }) => desc(comments.createdAt),
  });

  return c.json(comments);
});

commentApp.post("/comments", async (c) => {
  const { articleSlug, author, content } = await c.req.json();

  if (!articleSlug || !author || !content) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const db = createDb(c.env.DB);

  const newComment = await db
    .insert(comments)
    .values({
      articleSlug,
      author,
      content,
    })
    .returning();

  return c.json(newComment[0]);
});

export default commentApp;
