import type { Article } from "../utils/markdown";

export interface ArticlePageProps {
  article: Article;
}

export function articlePage({ article }: ArticlePageProps): string {
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
</article>`;
}
