import type { Article } from "../utils/markdown";

export interface ArticlePageProps {
  article: Article;
  apiOrigin?: string;
}

function apiPath(apiOrigin: string | undefined, path: string): string {
  return apiOrigin ? `${apiOrigin.replace(/\/$/, "")}${path}` : path;
}

export function articlePage({ article, apiOrigin }: ArticlePageProps): string {
  const commentsUrl = apiPath(apiOrigin, `/api/fragments/article-comments/${article.slug}`);

  return `<article class="article-page">
  <header>
    <a href="/" class="back">
      <span class="i-mdi-arrow-left"></span>
      Home
    </a>
    <h1>${article.title}</h1>
    <p>${article.description}</p>
    <time datetime="${article.createdAt}">
      ${new Date(article.createdAt).toLocaleDateString("zh-CN")}
    </time>
  </header>
  <main class="article-content">
    ${article.html}
  </main>
  <aside
    class="article-comments"
    hx-get="${commentsUrl}"
    hx-trigger="revealed"
    hx-swap="innerHTML"
  >
    <h2>Comments</h2>
    <p>Loading comments...</p>
  </aside>
</article>`;
}
