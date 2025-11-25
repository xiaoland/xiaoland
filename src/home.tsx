import { ArticleList } from "./ArticleList";
import { getAllArticles } from "@/logic";

export function Home() {
  const articleList = getAllArticles();

  return (
    <div className="bg-sys-bg-primary relative min-h-screen box-border px-[1.5rem] py-[2rem] md:pl-[3rem] md:pr-[2rem] md:py-[3rem] flex flex-col md:flex-row gap-[2rem] md:gap-[4rem]">
      <div className="flex flex-shrink-0 flex-col justify-between">
        {/* Intro */}
        <div className="flex flex-col">
          <span className="color-sys-text-primary font-size-[1.25rem] md:font-size-[1.5rem]">你好👋，我是</span>
          {/* Handle */}
          <div className="relative font-bold font-size-[3.5rem] md:font-size-[5.5rem]">
            <span className="color-sys-text-brand">蓝汁酱</span>
            {/* <span className="w-max text-transparent text-stroke-[1px] text-stroke-[#505050] absolute left-[0.6rem] top-[0.6rem] hover:left-0 hover:top-0 transition-all duration-300">
              蓝汁酱
            </span> */}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col text-[1.5rem] md:text-[2rem] color-sys-text-primary font-mono mt-[1.5rem] md:mt-0">
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
