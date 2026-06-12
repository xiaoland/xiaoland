import { Hono } from "hono";
import { ssgParams } from "hono/ssg";
import { layout } from "../templates/layout";
import { getArticle, getArticles } from "../utils/markdown";
import { renderArticlePage } from "../pages/article";
import { renderHomePage } from "../pages/home";
import { renderAboutPage } from "../pages/about";
import { renderXenixPage } from "../pages/xenix";
import { renderRssFeed } from "../site/feed";
import { renderSearchIndex } from "../site/search";
import { siteConfig } from "../site/config";
import { renderSitemap } from "../site/sitemap";

const app = new Hono();

const baseStyles = ["/uno.css", "/assets/variables.css", "/assets/global.css"];
const siteDescription =
  "Lanzhijiang 的个人网站，记录技术、生活、学习与长期思考。";

app.get("/", (c) => {
  const articles = getArticles();
  return c.html(
    layout({
      title: siteConfig.title,
      description: siteDescription,
      canonicalUrl: absoluteUrl("/"),
      body: renderHomePage({ articles }),
      assets: {
        styles: [...baseStyles, "/assets/home.css"],
      },
    }),
  );
});

app.get("/about", (c) => {
  return c.html(
    layout({
      title: `About - ${siteConfig.title}`,
      description: `关于 Lanzhijiang。${siteDescription}`,
      canonicalUrl: absoluteUrl("/about"),
      body: renderAboutPage(),
      assets: {
        styles: [...baseStyles, "/assets/article.css"],
      },
    }),
  );
});

// app.get("/xenix", (c) => {
//   return c.html(
//     layout({
//       title: `Xenix - ${siteConfig.title}`,
//       description: "Xenix 软件下载页面。提交邮箱或手机号后获取下载地址。",
//       canonicalUrl: absoluteUrl("/xenix"),
//       body: renderXenixPage({ apiOrigin: siteConfig.apiOrigin }),
//       assets: {
//         styles: [...baseStyles, "/assets/xenix.css"],
//       },
//     }),
//   );
// });

app.get(
  "/article/:slug",
  ssgParams(() => getArticles().map((article) => ({ slug: article.slug }))),
  (c) => {
    const article = getArticle(c.req.param("slug"));
    if (!article) {
      return c.notFound();
    }

    return c.html(
      layout({
        title: `${article.title} - ${siteConfig.title}`,
        description:
          article.description || `${article.title} - ${siteConfig.title}`,
        canonicalUrl: absoluteUrl(`/article/${article.slug}`),
        body: renderArticlePage({ article, apiOrigin: siteConfig.apiOrigin }),
        assets: {
          styles: [
            ...baseStyles,
            "/assets/article.css",
            "/assets/article-comment.css",
          ],
        },
      }),
    );
  },
);

app.get("/rss.xml", () => {
  const feed = renderRssFeed({
    articles: getArticles(),
    origin: siteConfig.origin,
    title: siteConfig.title,
  });
  return new Response(feed, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});

app.get("/sitemap.xml", () => {
  const sitemap = renderSitemap({
    articles: getArticles(),
    origin: siteConfig.origin,
  });
  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
});

app.get("/search-index.json", () => {
  return new Response(renderSearchIndex(getArticles()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
});

app.notFound((c) => {
  return c.html(
    layout({
      title: `Not Found - ${siteConfig.title}`,
      body: `<section class="article-page"><h1>Not Found</h1><p>The page does not exist.</p><p><a href="/">Home</a></p></section>`,
      assets: {
        styles: [...baseStyles],
      },
    }),
    404,
  );
});

export default app;

function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.origin).toString();
}
