import type { ArticleMeta } from "../utils/markdown";

export function renderSitemap({
  articles,
  origin,
}: {
  articles: ArticleMeta[];
  origin: string;
}): string {
  const urls = [
    "/",
    "/about",
    ...articles.map((article) => `/article/${article.slug}`),
  ];

  return `<?xml version="1.0" encoding="UTF-8" ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((path) => `  <url><loc>${new URL(path, origin).toString()}</loc></url>`)
  .join("\n")}
</urlset>`;
}
