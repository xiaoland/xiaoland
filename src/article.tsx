import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";
import { Script } from "vite-ssr-components/hono";

// Import articles dynamically
const articles = import.meta.glob("../articles/**/*.mdx", {
  eager: true,
});

const articleApp = new Hono<{ Bindings: { DB: D1Database } }>();

articleApp.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const articlePath = `../articles/${slug}/${slug}.mdx`;

  const articleModule = articles[articlePath] as any;

  if (!articleModule) {
    return c.text("Article not found", 404);
  }

  const { default: ArticleComponent, frontmatter } = articleModule;

  return c.render(
    <article>
      <h1>{frontmatter?.title || "Untitled"}</h1>
      <ArticleComponent />
    </article>
  );
});

export default articleApp;
