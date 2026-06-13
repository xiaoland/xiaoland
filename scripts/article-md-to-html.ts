import matter from "gray-matter";
import { marked } from "marked";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function normalizeIntoTagAttributeSafeString(str: string): string {
  return str.replace(/"/g, "&quot;");
}

async function formatWithBiome(filePath: string) {
  await execFileAsync("biome", ["format", "--write", filePath]);
}

async function main() {
  const [, , articleSlug] = process.argv;

  if (!articleSlug) {
    console.error("Usage: tsx script/article-md-to-html.ts <article-slug>");
    process.exit(1);
  }

  const input = resolve(`content/articles/${articleSlug}.md`);
  const output = resolve(`public/articles/${articleSlug}.html`);

  const markdown = await readFile(input, "utf-8");
  const { data, content } = matter(markdown);
  const body = await marked.parse(content);
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <meta name="description" content="${normalizeIntoTagAttributeSafeString(data.description)}">
  <link rel="stylesheet" href="/assets/main.css" />
  <link rel="stylesheet" href="/assets/variables.css" />
  <link rel="stylesheet" href="/articles/index.css" />
  <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols"
      rel="stylesheet"
  />
</head>
<body>
<header>
  <a class="back typo-control" href="/" onclick="if (history.length > 1) { history.back(); return false; }">
    <span class="material-symbols">arrow_back</span>
    <span>返回</span>
  </a>
  <h1>${data.title}</h1>
</header>
<main>
<article>
${body}
</article>
</main>
</body>
</html>`;

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf-8");
  await formatWithBiome(output);

  console.log(`Generated: ${output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
