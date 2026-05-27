import type { Article } from "../utils/markdown";
import { articlePage } from "../templates/article";

export function renderArticlePage({
  article,
  apiOrigin,
}: {
  article: Article;
  apiOrigin?: string;
}): string {
  return articlePage({ article, apiOrigin });
}
