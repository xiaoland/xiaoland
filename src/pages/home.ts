import type { ArticleMeta } from "../utils/markdown";
import { homePage } from "../templates/home";

export function renderHomePage({
  articles,
}: {
  articles: ArticleMeta[];
}): string {
  return homePage({ articles });
}
