import { Hono } from "hono";
import { Script } from "vite-ssr-components/hono";
import { HonoContextT } from "@/types";

// Import articles dynamically
const articles = import.meta.glob("../../articles/**/*.{md,mdx}", {
  eager: true,
});

const articleApp = new Hono<HonoContextT>();

articleApp.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const articlePathMdx = `../../articles/${slug}/${slug}.mdx`;
  const articlePathMd = `../../articles/${slug}/${slug}.md`;

  const articleModule = (articles[articlePathMdx] ||
    articles[articlePathMd]) as any;

  if (!articleModule) {
    return c.text("Article not found", 404);
  }

  const { default: ArticleComponent, frontmatter } = articleModule;

  return c.render(
    <>
      <article>
        <h1>{frontmatter?.title || "Untitled"}</h1>
        <ArticleComponent />
      </article>
      <div id="article-comments" data-slug={slug}>
        {/* Server-side rendered placeholder */}
        <div class="article-comments">
          <h2>评论</h2>
          <p>加载中...</p>
        </div>
      </div>
      <Script src="/src/comment/article-comments-client.tsx" type="module" />
    </>
  );
});

export default articleApp;
