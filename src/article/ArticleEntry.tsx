interface ArticleEntryProps {
  slug: string;
  title: string;
  description?: string;
  createdAt?: string;
}

function formatDateToMMDD(isoDateString: string): string {
  const date = new Date(isoDateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

export default function ArticleEntry({
  description = "Description text",
  title = "Article Title",
  createdAt = new Date().toISOString(),
}: ArticleEntryProps) {
  return (
    <div
      className="flex gap-3 justify-end max-w-[555px]"
      data-name="ArticleEntry"
      data-node-id="201:78"
    >
      <div
        className="basis-0 border-2 border-gray-600 border-solid box-border flex flex-col gap-3 grow h-full pb-6 pl-3 pr-6 pt-3  text-black"
        data-node-id="201:90"
      >
        <span className="relative shrink-0 text-3xl" data-node-id="201:77">
          {title}
        </span>
        <span className="min-w-full relative text-lg" data-node-id="201:141">
          {description}
        </span>
      </div>
      <div
        className="flex flex-col font-mono items-end relative text-gray-600 text-lg"
        data-node-id="201:122"
      >
        <span data-node-id="201:131">At</span>
        <span data-node-id="201:113">{formatDateToMMDD(createdAt)}</span>
      </div>
    </div>
  );
}
