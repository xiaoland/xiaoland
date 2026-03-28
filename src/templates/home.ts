import type { ArticleMeta } from '../utils/markdown';

export interface HomePageProps {
  articles: ArticleMeta[];
}

export function homePage({ articles }: HomePageProps): string {
  const articleList = articles.length
    ? articles
        .map(
          (a) => `
    <article>
      <a href="/article/${a.slug}">
        <h2>${a.title}</h2>
        <p>${a.description}</p>
        <time datetime="${a.createdAt}">
          ${new Date(a.createdAt).toLocaleDateString('zh-CN')}
        </time>
      </a>
    </article>`
        )
        .join('\n')
    : '<p>No articles yet.</p>';

  return `<header>
  <h1>Hi, I'm Lanzhijiang 👋</h1>
</header>
<section id="articles">
  ${articleList}
</section>`;
}
