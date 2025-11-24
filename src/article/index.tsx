import { Hono } from "hono";
import { Script } from "vite-ssr-components/hono";
import { HonoContextT } from "@/types";
import { getArticleModule, getArticleMetadata } from "@/logic";

const articleApp = new Hono<HonoContextT>();

articleApp.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const articleModule = getArticleModule(slug);
  const articleMetadata = getArticleMetadata(slug);

  if (!articleModule || !articleMetadata) {
    return c.text("Article not found", 404);
  }

  const { default: ArticleComponent } = articleModule;

  return c.render(
    <>
      <article>
        <h1>{articleMetadata.title}</h1>
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
