import type { Route } from "./+types/article.$slug";
import React, { useEffect, useRef } from "react";
import { drizzle } from 'drizzle-orm/d1';
import { comments } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { useFetcher } from "react-router-dom";
import type { InferSelectModel } from 'drizzle-orm';

type Comment = InferSelectModel<typeof comments>;

// Eagerly import all MDX files at build time
const articles = import.meta.glob<{ default: React.ComponentType; frontmatter?: any }>(
  "../../articles/**/*.mdx",
  { eager: true }
);

export async function loader({ context, params }: Route.LoaderArgs) {
  const { slug } = params;
  const db = drizzle(context.cloudflare.env.DB);
  
  // Find the article
  const articlePath = `../../articles/${slug}/${slug}.mdx`;
  const article = articles[articlePath];
  
  if (!article) {
    throw new Response("Article not found", { status: 404 });
  }

  const articleComments = await db.select().from(comments).where(eq(comments.articleSlug, slug)).all();
  
  return { 
    slug, 
    title: article.frontmatter?.title || slug,
    comments: articleComments,
  };
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const { slug } = params;
  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const author = formData.get('author') as string;
  const content = formData.get('content') as string;

  if (!author || !content) {
    return { error: "Author and content are required." };
  }

  try {
    const newComment = await db.insert(comments).values({
      articleSlug: slug,
      author,
      content,
      createdAt: new Date(),
    }).returning().get();
    return { comment: newComment };
  } catch (error) {
    return { error: "Failed to post comment." };
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.title || "Article" },
    { name: "description", content: `Read ${data?.title || "this article"}` },
  ];
}

function CommentForm() {
  const fetcher = useFetcher<Route.ActionData>();
  const formRef = useRef<HTMLFormElement>(null);

  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.comment) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <fetcher.Form ref={formRef} method="post" className="bg-white p-6 rounded-lg shadow-md">
      {fetcher.data?.error && <p className="text-red-500 mb-4">{fetcher.data.error}</p>}
      <div className="mb-4">
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" name="author" id="author" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required disabled={isSubmitting} />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Comment</label>
        <textarea name="content" id="content" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required disabled={isSubmitting}></textarea>
      </div>
      <button type="submit" className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" disabled={isSubmitting}>
        {isSubmitting ? "Posting..." : "Post Comment"}
      </button>
    </fetcher.Form>
  );
}

function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-2">
            <p className="font-bold text-gray-800">{comment.author}</p>
            <p className="text-xs text-gray-400 ml-auto">{new Date(comment.createdAt).toLocaleString()}</p>
          </div>
          <p className="text-gray-600">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}

export default function Article({ loaderData }: Route.ComponentProps) {
  const { slug, title } = loaderData;
  const fetcher = useFetcher<Route.ActionData>();
  const [comments, setComments] = React.useState(loaderData.comments);

  useEffect(() => {
    if (fetcher.data?.comment) {
      setComments((prevComments) => [...prevComments, fetcher.data.comment]);
    }
  }, [fetcher.data]);
  
  const articlePath = `../../articles/${slug}/${slug}.mdx`;
  const article = articles[articlePath];
  const MDXContent = article?.default;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 container mx-auto p-4 max-w-4xl">
        <article className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow-md">
          {MDXContent && <MDXContent />}
        </article>
      </main>
      
      {/* Comments */}
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Comments</h2>
          <CommentForm />
          <div className="mt-8">
            <CommentList comments={comments} />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 XiaoLand. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
