import { ArticleList } from "./ArticleList";
import { getAllArticles } from "@/logic";

export function Home() {
  const articleList = getAllArticles();

  return (
    <div className="bg-comp-home-bg relative h-screen box-border pl-[3rem] pr-[2rem] py-[3rem] flex flex-row gap-[4rem]">
      <div className="flex flex-shrink-0 flex-col justify-between">
        {/* Intro */}
        <div className="flex flex-col">
          <span className="color-comp-home-text font-size-[1.5rem]">你好👋，我是</span>
          {/* Handle */}
          <div className="relative font-bold font-size-[5.5rem]">
            <span className="color-comp-home-title">蓝汁酱</span>
            {/* <span className="w-max text-transparent text-stroke-[1px] text-stroke-[#505050] absolute left-[0.6rem] top-[0.6rem] hover:left-0 hover:top-0 transition-all duration-300">
              蓝汁酱
            </span> */}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col text-[2rem] color-comp-home-tags font-mono">
          <span>Pythonist</span>
          <span>Vuer</span>
          <span>Homelaber</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 box-border flex flex-col items-center gap-[1.5rem] flex-1 min-h-0">
        <ArticleList articles={articleList} />
      </div>
    </div>
  );
}
