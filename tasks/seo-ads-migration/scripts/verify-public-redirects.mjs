import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const taskDir = path.join(repoRoot, "tasks/seo-ads-migration");
const csvPath = path.join(taskDir, "old-url-map.csv");
const outputPath = path.join(taskDir, "public-redirect-verification.md");

const rows = parseCsv(await readFile(csvPath, "utf8")).slice(1);
const checks = rows.flatMap((row) => {
  const [archiveId, oldUrl, newUrl, slug] = row;
  return [
    {
      type: "canonical-old-article",
      label: `archive ${archiveId} -> ${slug}`,
      url: oldUrl,
      expectedLocation: newUrl,
      expectedStatus: 301,
    },
    {
      type: "pathinfo-old-article",
      label: `archive ${archiveId} pathinfo -> ${slug}`,
      url: `https://blog.hadream.ltd/archives/${archiveId}/`,
      expectedLocation: newUrl,
      expectedStatus: 301,
    },
  ];
});

checks.push(
  {
    type: "home",
    label: "home root",
    url: "https://blog.hadream.ltd/",
    expectedLocation: "https://lanzhijiang.dev/",
    expectedStatus: 301,
  },
  {
    type: "home",
    label: "home index.php",
    url: "https://blog.hadream.ltd/index.php",
    expectedLocation: "https://lanzhijiang.dev/",
    expectedStatus: 301,
  },
  {
    type: "special",
    label: "about",
    url: "https://blog.hadream.ltd/index.php/about-page.html",
    expectedLocation: "https://lanzhijiang.dev/about",
    expectedStatus: 301,
  },
  {
    type: "special",
    label: "about pathinfo",
    url: "https://blog.hadream.ltd/about-page.html",
    expectedLocation: "https://lanzhijiang.dev/about",
    expectedStatus: 301,
  },
  {
    type: "special",
    label: "feed",
    url: "https://blog.hadream.ltd/index.php/feed/",
    expectedLocation: "https://lanzhijiang.dev/rss.xml",
    expectedStatus: 301,
  },
  {
    type: "special",
    label: "feed pathinfo",
    url: "https://blog.hadream.ltd/feed/",
    expectedLocation: "https://lanzhijiang.dev/rss.xml",
    expectedStatus: 301,
  },
  {
    type: "excluded",
    label: "sub_blog remains on old site",
    url: "https://blog.hadream.ltd/index.php/sub_blog.html",
    expectedStatus: 200,
  },
);

const results = [];
for (const check of checks) {
  results.push(await verify(check));
}

const failures = results.filter((result) => !result.ok);
const groupedFailures = groupBy(failures, (result) => result.type);
const lines = [
  "# Public redirect verification",
  "",
  `- Checked at: ${new Date().toISOString()}`,
  `- Total checks: ${results.length}`,
  `- Failed checks: ${failures.length}`,
  "",
  "## Summary",
  "",
  ...Object.entries(groupBy(results, (result) => result.type)).map(([type, values]) => {
    const failed = values.filter((value) => !value.ok).length;
    return `- ${type}: ${values.length - failed}/${values.length} passed`;
  }),
  "",
  "## Failures",
  "",
];

if (failures.length === 0) {
  lines.push("None.");
} else {
  for (const [type, values] of Object.entries(groupedFailures)) {
    lines.push(`### ${type}`, "");
    for (const result of values) {
      lines.push(
        `- ${result.label}`,
        `  - url: ${result.url}`,
        `  - status: ${result.status ?? "request failed"} (expected ${result.expectedStatus})`,
        `  - location: ${result.location ?? ""}`,
        result.error ? `  - error: ${result.error}` : "",
      );
    }
    lines.push("");
  }
}

await writeFile(outputPath, `${lines.filter(Boolean).join("\n")}\n`);

console.log(`Wrote ${outputPath}`);
console.log(`total=${results.length} failed=${failures.length}`);

async function verify(check) {
  try {
    const response = await fetch(check.url, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
    const status = response.status;
    const location = response.headers.get("location");
    const statusOk = status === check.expectedStatus;
    const locationOk = check.expectedLocation === undefined || location === check.expectedLocation;

    return {
      ...check,
      status,
      location,
      ok: statusOk && locationOk,
    };
  } catch (error) {
    return {
      ...check,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function groupBy(values, getKey) {
  return values.reduce((groups, value) => {
    const key = getKey(value);
    groups[key] ??= [];
    groups[key].push(value);
    return groups;
  }, {});
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    const next = input[index + 1];

    if (quoted && char === '"' && next === '"') {
      cell += '"';
      index++;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (!quoted && char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!quoted && char === "\n") {
      row.push(cell);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
