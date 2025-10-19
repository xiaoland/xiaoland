import React from "react";

import Comments from "../components/Comments";
import { loader as commentsLoader } from "./api.articles.$slug.comments";

// Eagerly import all MDX files at build time
const articles = import.meta.glob<{ default: React.ComponentType; frontmatter?: any }>(
  "../../articles/**/*.mdx",
  { eager: true }
);

export async function loader({ params, context, request }: Route.LoaderArgs) {
  const { slug } = params;
  
  // Find the article
  const articlePath = `../../articles/${slug}/${slug}.mdx`;
  const article = articles[articlePath];
  
  if (!article) {
    throw new Response("Article not found", { status: 404 });
  }

  const comments = await commentsLoader({ params, context, request: new Request(new URL(request.url)) });
  
  return { 
    slug, 
    title: article.frontmatter?.title || slug,
    comments: await comments.json(),
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.title || "Article" },
    { name: "description", content: `Read ${data?.title || "this article"}` },
  ];
}

export default function Article({ loaderData }: Route.ComponentProps) {
  const { slug, title } = loaderData;
  
  const articlePath = `../../articles/${slug}/${slug}.mdx`;
  const article = articles[articlePath];
  const MDXContent = article?.default;
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 container mx-auto p-4 max-w-4xl">
        <article className="prose prose-lg max-w-none">
          {MDXContent && <MDXContent />}
        </article>
      </main>
      
      <Comments />
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 XiaoLand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
