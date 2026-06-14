import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve("dist");

await Promise.all([
  assertExists("index.html"),
  assertExists("about.html"),
  assertExists("rss.xml"),
  assertExists("sitemap.xml"),
  assertExists("search-index.json"),
]);

const articleFiles = await findArticleFiles(path.join(distDir, "article"));
if (!articleFiles.length) {
  throw new Error("No generated article pages found in dist/article");
}

const htmlFiles = [path.join(distDir, "index.html"), path.join(distDir, "about.html"), ...articleFiles];
for (const htmlFile of htmlFiles) {
  const html = await readFile(htmlFile, "utf8");
  for (const assetPath of html.matchAll(/(?:href|src)="(\/(?:assets|images)\/[^"]+|\/uno\.css)"/g)) {
    await assertExists(assetPath[1].replace(/^\//, ""));
  }
}

async function assertExists(relativePath: string): Promise<void> {
  await access(path.join(distDir, relativePath));
}

async function findArticleFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findArticleFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
    }),
  );

  return files.flat();
}
