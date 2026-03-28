import type { Article } from "../utils/markdown";

export interface ArticlePageProps {
  article: Article;
}

export function articlePage({ article }: ArticlePageProps): string {
  return `<article>
  <header>
    <a href="/">
      <span class="i-mdi-account-box"></span>
      Back
    </a>
    <h1>${article.title}</h1>
    <p>${article.description}</p>
    <time datetime="${article.createdAt}">
      ${new Date(article.createdAt).toLocaleDateString("zh-CN")}
    </time>
  </header>
  <div class="article-content">
    ${article.html}
  </div>
</article>`;
}
