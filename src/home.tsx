import { ArticleList } from "./ArticleList";
import handleCnOutlinedSvg from "./assets/handle-cn-outlined.svg";

// Import articles to get metadata
const articles = import.meta.glob("../articles/**/*.{md,mdx}", {
  eager: true,
});

export function Home() {
  const articleList = Object.keys(articles)
    .filter((path) => {
      // Exclude README files and files directly in the articles folder
      const pathParts = path.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const isReadme = fileName.toLowerCase().startsWith("readme");
      const isInSubdirectory = pathParts.length > 3; // ../articles/{slug}/{file}
      
      return !isReadme && isInSubdirectory;
    })
    .map((path) => {
      const articleModule = articles[path] as any;
      const slug = path.split("/").slice(-2, -1)[0]; // Extract slug from path
      return {
        slug,
        title: articleModule.frontmatter?.title,
        description: articleModule.frontmatter?.description,
        lastUpdateDate: articleModule.frontmatter?.date,
      };
    });

  return (
    <div className="bg-[#eaeffa] relative h-screen box-border pl-[3rem] pr-[2rem] py-[3rem] flex flex-row gap-[4rem]">
      <div className="flex flex-col justify-between">
        {/* Intro */}
        <div className="flex flex-col">
          <span className=" text-black font-size-[1.5rem]">你好👋，我是</span>
          {/* Handle */}
          <div className="relative font-bold font-size-[5.5rem]">
            <span className="text-[#2f65f7]">蓝汁酱</span>
            {/* <span className="w-max text-transparent text-stroke-[1px] text-stroke-[#505050] absolute left-[0.6rem] top-[0.6rem] hover:left-0 hover:top-0 transition-all duration-300">
              蓝汁酱
            </span> */}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col text-[2rem] text-black font-mono">
          <span>Pythonist</span>
          <span>Vuer</span>
          <span>Homelaber</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 box-border flex flex-col gap-[1.5rem] overflow-scroll">
        <ArticleList articles={articleList} />
      </div>
    </div>
  );
}
