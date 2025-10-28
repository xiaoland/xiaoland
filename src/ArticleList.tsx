import "./ArticleList.scss";

export interface ArticleMetadata {
  slug: string;
  title: string;
}

export function ArticleList({ articles }: { articles: ArticleMetadata[] }) {
  return (
    <div class="article-list">
      <h1>文章列表</h1>
      {articles.length === 0 ? (
        <p>暂无文章</p>
      ) : (
        <ul>
          {articles.map((article) => (
            <li key={article.slug}>
              <a href={`/article/${article.slug}`}>{article.title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
