import { Hono } from "hono";
import { renderer } from "./renderer";
import articleApp from "./article";
import { createDb } from "./db";
import { comments } from "./db/schema";
import type { D1Database } from "@cloudflare/workers-types";

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.use(renderer);

// API routes for comments
app.get("/api/comments/:slug", async (c) => {
  const slug = c.req.param("slug");
  const db = createDb(c.env.DB);

  const comments = await db.query.comments.findMany({
    where: (comments, { eq }) => eq(comments.articleSlug, slug),
    orderBy: (comments, { desc }) => desc(comments.createdAt),
  });

  return c.json(comments);
});

app.post("/api/comments", async (c) => {
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

app.get("/", (c) => {
  return c.html(`
    <h1>Welcome to lanzhijiang</h1>
    <p>This is the homepage.</p>
  `);
});

app.route("/article", articleApp);

export default app;
