import type { ArticleMeta } from "../utils/markdown";

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
        <p style="display: ${a.description ? "auto" : "none"}">${a.description}</p>
        <time datetime="${a.createdAt}">
          ${new Date(a.createdAt).toLocaleDateString("zh-CN")}
        </time>
      </a>
    </article>`,
        )
        .join("\n")
    : "<p>No articles yet.</p>";

  return `<header>
  <h1>Hi, I'm Lanzhijiang 👋</h1>
</header>
<section id="articles">
  ${articleList}
</section>
<section id="links">
  <a href="/xenix">Xenix</a>
  <a href="https://github.com/xiaoland" target="blank">GitHub</a>
  <a href="https://x.com/Lan_zhijiang" target="blank">Tweet</a>
</section>`;
}
