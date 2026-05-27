import type { ArticleMeta } from "../utils/markdown";
import { escapeHtml } from "./html";

export function renderRssFeed({
  articles,
  origin,
  title,
}: {
  articles: ArticleMeta[];
  origin: string;
  title: string;
}): string {
  const items = articles
    .map((article) => {
      const url = new URL(`/article/${article.slug}`, origin).toString();
      return `<item>
  <title>${escapeHtml(article.title)}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <description>${escapeHtml(article.description)}</description>
  <pubDate>${new Date(article.createdAt).toUTCString()}</pubDate>
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>${escapeHtml(title)}</title>
  <link>${origin}</link>
  <description>${escapeHtml(title)}</description>
${items}
</channel>
</rss>`;
}
