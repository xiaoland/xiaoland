import ArticleEntry from "./article/ArticleEntry";
import { ArticleMetadata } from "@/logic";

export function ArticleList({
  articles,
  listTitle,
}: {
  articles: ArticleMetadata[];
  listTitle?: string;
}) {
  return (
    <div className="flex flex-col h-full">
      <span className="text-[2.5rem] text-article-list-title mb-[1.5rem] flex-shrink-0">
        {listTitle || "文章列表"}
      </span>
      <div className="flex flex-col gap-[1.5rem] overflow-y-auto flex-1">
        {articles.length === 0 ? (
          <p className="text-article-list-empty text-base">暂无文章</p>
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
                createdAt={article.createdAt}
              />
            </a>
          ))
        )}
      </div>
    </div>
  );
}
