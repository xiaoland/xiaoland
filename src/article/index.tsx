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

  // Set the page title and meta tags
  c.set("title", articleMetadata.title);
  c.set("description", articleMetadata.description || articleMetadata.title);
  c.set("canonicalUrl", `https://lanzhijiang.com/article/${slug}`);
  c.set("ogImage", `https://lanzhijiang.com/og-image-${slug}.png`);

  return c.render(
    <div className="min-h-screen bg-sys-bg-secondary">
      <div className="max-w-[720px] mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold color-sys-text-heading leading-tight mb-4">
            {articleMetadata.title}
          </h1>
          {articleMetadata.description && (
            <span className="text-lg color-sys-text-secondary block mb-4">
              {articleMetadata.description}
            </span>
          )}
          <span className="text-sm font-mono color-sys-text-tertiary">
            {formatDate(articleMetadata.createdAt)}
          </span>
        </header>

        {/* Article Content */}
        <article className="article-content color-sys-text-primary">
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
      
      {/* Table of Contents */}
      <div id="article-toc"></div>
      
      <Script src="/src/article/article-toc-client.tsx" type="module" />
      <Script src="/src/comment/article-comments-client.tsx" type="module" />
    </div>
  );
});

export default articleApp;
