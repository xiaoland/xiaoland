import { Hono } from "hono";
import { renderer } from "./renderer";
import articleApp from "./article";
import { createDb } from "./db";
import { comments } from "./db/schema";
import type { D1Database } from "@cloudflare/workers-types";
import { ArticleList } from "./ArticleList";

// Import articles to get metadata
const articles = import.meta.glob("../articles/**/*.mdx", {
  eager: true,
});

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
  // Extract article metadata from imported MDX files
  const articleList = Object.keys(articles)
    .filter((path) => path.endsWith(".mdx"))
    .map((path) => {
      const articleModule = articles[path] as any;
      const slug = path.split("/").slice(-2, -1)[0]; // Extract slug from path
      return {
        slug,
        title: articleModule.frontmatter?.title || "Untitled",
      };
    });

  return c.render(<ArticleList articles={articleList} />);
});

app.route("/article", articleApp);

export default app;
