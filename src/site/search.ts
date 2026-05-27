import type { ArticleMeta } from "../utils/markdown";

export function renderSearchIndex(articles: ArticleMeta[]): string {
  return JSON.stringify(
    articles.map((article) => ({
      slug: article.slug,
      url: `/article/${article.slug}`,
      title: article.title,
      description: article.description,
      createdAt: article.createdAt,
    })),
    null,
    2,
  );
}
