import { Hono } from "hono";
import { Script } from "vite-ssr-components/hono";
import { HonoContextT } from "@/types";
import { getArticleModule, getArticleMetadata } from "@/logic";

const articleApp = new Hono<HonoContextT>();

function formatDate(isoDateString: string): string {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

articleApp.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const articleModule = getArticleModule(slug);
  const articleMetadata = getArticleMetadata(slug);

  if (!articleModule || !articleMetadata) {
    return c.text("Article not found", 404);
  }

  const { default: ArticleComponent } = articleModule;

  // Set the page title to the article title
  c.set("title", articleMetadata.title);

  return c.render(
    <div className="min-h-screen bg-comp-article-page-bg">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold color-comp-article-page-title leading-tight mb-4">
            {articleMetadata.title}
          </h1>
          {articleMetadata.description && (
            <span className="text-lg color-sys-text-secondary block mb-4">
              {articleMetadata.description}
            </span>
          )}
          <span className="text-sm font-mono color-comp-article-page-meta">
            {formatDate(articleMetadata.createdAt)}
          </span>
        </header>

        {/* Article Content */}
        <article className="article-content color-comp-article-page-content-text">
          <ArticleComponent />
        </article>

        {/* Comments Section */}
        <div id="article-comments" data-slug={slug} className="mt-16 pt-8 border-t border-sys-border-default">
          <div className="article-comments">
            <h2 className="text-2xl font-bold color-sys-text-primary mb-6">评论</h2>
            <span className="color-sys-text-tertiary">加载中...</span>
          </div>
        </div>
      </div>
      <Script src="/src/comment/article-comments-client.tsx" type="module" />
    </div>
  );
});

export default articleApp;
