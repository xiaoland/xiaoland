import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

const ARTICLES_DIR = path.join(process.cwd(), "articles");

export interface ArticleFrontmatter {
  title?: string;
  description?: string;
  publishTo?: string[];
  createdAt?: string;
}

/**
 * Get all article files from the articles directory
 */
async function getArticleFiles(): Promise<string[]> {
  const allFiles: string[] = [];
  const entries = await fs.readdir(ARTICLES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(ARTICLES_DIR, entry.name);
    if (entry.isDirectory()) {
      const subEntries = await fs.readdir(fullPath, { withFileTypes: true });
      for (const subEntry of subEntries) {
        if (
          subEntry.isFile() &&
          (subEntry.name.endsWith(".md") || subEntry.name.endsWith(".mdx")) &&
          !subEntry.name.toLowerCase().startsWith("readme")
        ) {
          allFiles.push(path.join(fullPath, subEntry.name));
        }
      }
    }
  }
  return allFiles;
}

/**
 * Get default frontmatter values for missing fields
 */
function getDefaultFrontmatter(
  existing: ArticleFrontmatter,
  slug: string
): Required<ArticleFrontmatter> {
  const now = new Date().toISOString();

  return {
    title: existing.title ?? "Untitled",
    description: existing.description ?? "",
    publishTo: existing.publishTo ?? [],
    createdAt: existing.createdAt ?? now,
  };
}

/**
 * Check if frontmatter has any missing required fields
 */
function hasMissingFields(frontmatter: ArticleFrontmatter): boolean {
  return (
    frontmatter.title === undefined ||
    frontmatter.description === undefined ||
    frontmatter.publishTo === undefined ||
    frontmatter.createdAt === undefined
  );
}

/**
 * Complete missing frontmatter in article files
 */
export async function completeFrontmatter(): Promise<{
  updated: string[];
  skipped: string[];
}> {
  const files = await getArticleFiles();
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const fileContent = await fs.readFile(file, "utf-8");
    const { data, content } = matter(fileContent);
    const frontmatter = data as ArticleFrontmatter;

    if (!hasMissingFields(frontmatter)) {
      skipped.push(file);
      continue;
    }

    const slug = path.basename(path.dirname(file));
    const completedFrontmatter = getDefaultFrontmatter(frontmatter, slug);

    // Build new file content with completed frontmatter
    const newContent = matter.stringify(content, completedFrontmatter);
    await fs.writeFile(file, newContent, "utf-8");

    updated.push(file);
    console.log(`Updated frontmatter for: ${slug}`);
  }

  return { updated, skipped };
}

// Run if executed directly
const isMainModule = process.argv[1]?.endsWith("complete-frontmatter.js");
if (isMainModule) {
  completeFrontmatter()
    .then(({ updated, skipped }) => {
      console.log(`\nCompleted frontmatter update:`);
      console.log(`  Updated: ${updated.length} files`);
      console.log(`  Skipped: ${skipped.length} files (already complete)`);
    })
    .catch(console.error);
}
