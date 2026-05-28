import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const taskDir = path.join(repoRoot, "tasks/seo-ads-migration");
const articlesDir = path.join(repoRoot, "content/articles");
const oldSearchIndexUrl =
  "https://blog.hadream.ltd/usr/plugins/ExSearch/cache/cache-c315aab01aa8a05c8f1a3f64bbba792c.json";

const articleFiles = (await readdir(articlesDir))
  .filter((file) => file.endsWith(".md"))
  .sort();

const articles = [];
for (const file of articleFiles) {
  const raw = await readFile(path.join(articlesDir, file), "utf8");
  const frontmatter = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, "");

  articles.push({
    slug,
    title: frontmatter.title ?? "Untitled",
    createdAt: frontmatter.createdAt ?? "",
    oldUrl: frontmatter.oldUrl ?? "",
    newUrl: `https://lanzhijiang.dev/article/${slug}`,
  });
}

const oldSearchIndex = await fetchJson(oldSearchIndexUrl);
const oldUrls = new Set(oldSearchIndex.posts.map((post) => post.path));
const localOldUrls = new Set(articles.filter((article) => article.oldUrl).map((article) => article.oldUrl));

const rows = articles
  .filter((article) => article.oldUrl)
  .sort((a, b) => numericArchiveId(a.oldUrl) - numericArchiveId(b.oldUrl));

const csv = [
  ["archive_id", "old_url", "new_url", "slug", "title", "created_at"].join(","),
  ...rows.map((article) =>
    [
      csvCell(String(numericArchiveId(article.oldUrl))),
      csvCell(article.oldUrl),
      csvCell(article.newUrl),
      csvCell(article.slug),
      csvCell(article.title),
      csvCell(article.createdAt),
    ].join(","),
  ),
].join("\n");

const oldOnly = [...oldUrls].filter((url) => !localOldUrls.has(url)).sort();
const localOnly = [...localOldUrls].filter((url) => !oldUrls.has(url)).sort();
const noOldUrl = articles.filter((article) => !article.oldUrl).sort((a, b) => a.slug.localeCompare(b.slug));

const diff = `# URL Inventory Diff

- Old Typecho ExSearch posts: ${oldUrls.size}
- Local markdown articles: ${articles.length}
- Local articles with \`oldUrl\`: ${localOldUrls.size}
- Old URLs missing in local frontmatter: ${oldOnly.length}
- Local \`oldUrl\` values missing from old ExSearch: ${localOnly.length}
- Local-only articles without old URL: ${noOldUrl.length}

## Old URLs Missing Locally

${oldOnly.length ? oldOnly.map((url) => `- ${url}`).join("\n") : "- None"}

## Local oldUrl Values Missing In Old Search Cache

${localOnly.length ? localOnly.map((url) => `- ${url}`).join("\n") : "- None"}

## Local-Only Articles

${noOldUrl.map((article) => `- ${article.slug} (${article.title})`).join("\n")}
`;

await writeFile(path.join(taskDir, "old-url-map.csv"), `${csv}\n`);
await writeFile(path.join(taskDir, "url-inventory-diff.md"), diff);

console.log(`Wrote ${rows.length} redirects to tasks/seo-ads-migration/old-url-map.csv`);
console.log(`Wrote diff to tasks/seo-ads-migration/url-inventory-diff.md`);

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }

  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    value = value.replace(/^['"]|['"]$/g, "");
    data[key] = value;
  }

  return data;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function numericArchiveId(url) {
  const match = url.match(/\/archives\/(\d+)\//);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function csvCell(value) {
  return `"${value.replaceAll('"', '""')}"`;
}
