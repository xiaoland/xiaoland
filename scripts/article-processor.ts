import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { getDrafts, Draft } from './wxoa-api';

const ARTICLES_DIR = path.join(process.cwd(), 'articles');
const SITE_URL = process.env.SITE_URL;

if (!SITE_URL) {
  throw new Error('Missing SITE_URL environment variable');
}

export interface Article {
  slug: string;
  title: string;
  content: string;
  content_source_url: string;
  filePath: string;
  coverImage?: string;
  [key: string]: any;
}

async function getArticleFiles(): Promise<string[]> {
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')))
    .map(entry => path.join(ARTICLES_DIR, entry.name));
}

export async function processArticles(): Promise<{
  toAddArticles: Article[];
  toUpdateArticles: (Article & { media_id: string })[];
}> {
  const files = await getArticleFiles();
  const articles: Article[] = [];

  for (const file of files) {
    const fileContent = await fs.readFile(file, 'utf-8');
    const { data, content } = matter(fileContent);

    if (data.publishTo && data.publishTo.includes('wxoa')) {
      const slug = path.basename(file, path.extname(file));
      articles.push({
        ...data,
        slug,
        title: data.title,
        content: marked(content),
        content_source_url: `${SITE_URL}/article/${slug}`,
        filePath: file,
      });
    }
  }

  const drafts = await getDrafts();
  const draftSlugs = new Map(
    drafts.map(draft => {
      const url = draft.content.news_item[0].content_source_url;
      const slug = url.split('/').pop() || '';
      return [slug, draft.media_id];
    })
  );

  const toAddArticles: Article[] = [];
  const toUpdateArticles: (Article & { media_id: string })[] = [];

  for (const article of articles) {
    if (draftSlugs.has(article.slug)) {
      toUpdateArticles.push({
        ...article,
        media_id: draftSlugs.get(article.slug)!,
      });
    } else {
      toAddArticles.push(article);
    }
  }

  return { toAddArticles, toUpdateArticles };
}
