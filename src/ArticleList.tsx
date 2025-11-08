import ArticleEntry from "./article/ArticleEntry";

export interface ArticleMetadata {
  slug: string;
  title: string;
  description?: string;
  lastUpdateDate?: string;
}

export function ArticleList({
  articles,
  listTitle,
}: {
  articles: ArticleMetadata[];
  listTitle?: string;
}) {
  return (
    <div className="flex flex-col gap-[1.5rem]">
      <span className="text-[2.5rem] text-[#02113b]">
        {listTitle || "文章列表"}
      </span>
      {articles.length === 0 ? (
        <p className="text-gray-600 text-base">暂无文章</p>
      ) : (
        articles.map((article) => (
          <a
            key={article.slug}
            href={`/article/${article.slug}`}
            className="no-underline"
          >
            <ArticleEntry
              slug={article.slug}
              title={article.title}
              description={article.description}
              lastUpdateDate={article.lastUpdateDate}
            />
          </a>
        ))
      )}
    </div>
  );
}
