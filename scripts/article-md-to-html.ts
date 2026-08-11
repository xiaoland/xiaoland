import matter from "gray-matter";
import { marked, Marked, Renderer, type Tokens } from "marked";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const SITE_ORIGIN = "https://lanzhijiang.dev";
const articleMarkdownPathStr = "content/articles";
const articleHtmlPathStr = "public/articles";
const execFileAsync = promisify(execFile);
const defaultRenderer = new Renderer();

function normalizeIntoTagAttributeSafeString(str: string): string {
  return str.replace(/"/g, "&quot;");
}

async function formatWithBiome(filePath: string) {
  await execFileAsync("biome", ["format", "--write", filePath]);
}

const markdownParser = new Marked({
  gfm: true,
  renderer: {
    table(this: Renderer, token: Tokens.Table) {
      const tableHtml = defaultRenderer.table.call(this, token);

      return `<div id="table-wrapper">\n${tableHtml}</div>\n`;
    },
  },
});

function renderMarkdown(markdown: string) {
  return markdownParser.parse(markdown);
}

async function main() {
  const [, , articleSlug, htmlTemplatePath = "src/templates/article.html"] =
    process.argv;

  let proceedWithAll = false;

  if (!articleSlug) {
    if (!stdin.isTTY) {
      console.error("Usage: tsx script/article-md-to-html.ts <article-slug>");
      process.exit(1);
    } else {
      const rl = createInterface({ input: stdin, output: stdout });
      try {
        while (true) {
          const answer = await rl.question(
            "No articleSlug provided, proceed to all articles? [y/N]",
          );
          if (["y", "yes"].includes(answer)) {
            proceedWithAll = true;
          }
          break;
        }
      } catch {
        rl.close();
      }
    }
  }

  const articleSlugs = [];
  if (proceedWithAll) {
    const entries = await readdir(resolve(articleMarkdownPathStr), {
      withFileTypes: true,
    });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        articleSlugs.push(entry.name.replace(".md", ""));
      }
    }
  } else {
    if (articleSlug) {
      articleSlugs.push(articleSlug);
    } else {
      console.log("Will do nothing");
    }
  }

  const results = await Promise.allSettled(
    articleSlugs.map((articleSlug) => mdToHtml(articleSlug, htmlTemplatePath)),
  );
  for (const [index, result] of results.entries()) {
    const file = articleSlugs[index];

    if (result.status === "fulfilled") {
      console.log(`OK: ${file}`);
    } else {
      console.error(`Failed: ${file}`);
      console.error(result.reason);
    }
  }
  process.exit(0);
}

async function mdToHtml(articleSlug: string, htmlTemplatePath: string) {
  const input = resolve(`${articleMarkdownPathStr}/${articleSlug}.md`);
  const output = resolve(`${articleHtmlPathStr}/${articleSlug}.html`);

  const markdown = await readFile(input, "utf-8");
  const { data, content } = matter(markdown);
  const body = await renderMarkdown(content);
  const status = data.status ?? "published";
  if (status === "draft") {
    console.log(`${articleSlug} is a draft`);
    console.log(`-----------`);
    return;
  }
  const updatedAt = data.updatedAt ?? data.finishedAt ?? data.createdAt;
  const createdAt = data.createdAt ?? null;
  const finishedAt = data.finishedAt ?? null;
  const canonicalUrl = new URL(
    `/articles/${articleSlug}`,
    SITE_ORIGIN,
  ).toString();

  const htmlTemplate = await readFile(resolve(htmlTemplatePath), "utf-8");
  let html = htmlTemplate
    .replace("${body}", body)
    .replaceAll("${data.title}", data.title)
    .replaceAll(
      "${data.description}",
      normalizeIntoTagAttributeSafeString(data.description ?? ""),
    )
    .replaceAll("${data.datetime}", updatedAt)
    .replaceAll("${data.canonicalUrl}", canonicalUrl);
  // handling optional data fields
  if (createdAt !== null) {
    html = html.replaceAll("${data.createdAt}", createdAt);
    html = html.replace("<!-- createdAt", "");
    html = html.replace("createdAt -->", "");
  }
  if (finishedAt !== null) {
    html = html.replaceAll("${data.finishedAt}", finishedAt);
    html = html.replace("<!-- finishedAt", "");
    html = html.replace("finishedAt -->", "");
  }

  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf-8");
  await formatWithBiome(output);

  console.log(`Generated: ${output}`);
  console.log(`Updated at: ${updatedAt}`);
  console.log(`-----------`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
