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
  const [, , articleSlug, htmlTemplatePath = "src/templates/article.html"] =
    process.argv;

  if (!articleSlug) {
    console.error("Usage: tsx script/article-md-to-html.ts <article-slug>");
    process.exit(1);
  }

  const input = resolve(`content/articles/${articleSlug}.md`);
  const output = resolve(`public/articles/${articleSlug}.html`);

  const markdown = await readFile(input, "utf-8");
  const { data, content } = matter(markdown);
  const body = await marked.parse(content);
  const lastUpdatedAt = data.createdAt ?? data.updatedAt;

  const htmlTemplate = await readFile(resolve(htmlTemplatePath), "utf-8");
  const html = htmlTemplate
    .replace("${body}", body)
    .replaceAll("${data.title}", data.title)
    .replace(
      "${data.description}",
      normalizeIntoTagAttributeSafeString(data.description),
    )
    .replace("${data.datetime}", lastUpdatedAt)
    .replace(
      "${data.date}",
      new Date(data.createdAt ?? data.updatedAt).toDateString(),
    );

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf-8");
  await formatWithBiome(output);

  console.log(`Generated: ${output}`);
  console.log(`Last updated at: ${lastUpdatedAt}`);
  console.log(`-----------`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
