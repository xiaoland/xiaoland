import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const taskDir = path.join(repoRoot, "tasks/seo-ads-migration");
const knownHosts = path.join(taskDir, "known_hosts.websp");
const csv = await readFile(path.join(taskDir, "old-url-map.csv"), "utf8");
const rows = parseCsv(csv).slice(1);

const checks = rows.map((row) => {
  const [, oldUrl, newUrl, slug] = row;
  return {
    label: slug,
    path: new URL(oldUrl).pathname,
    expected: newUrl,
  };
});

checks.push({
  label: "about-page",
  path: "/index.php/about-page.html",
  expected: "https://lanzhijiang.dev/about",
});

checks.push({
  label: "feed",
  path: "/index.php/feed/",
  expected: "https://lanzhijiang.dev/rss.xml",
});

const results = [];
for (const check of checks) {
  const url = `http://127.0.0.1:81${check.path}`;
  const remoteCommand = [
    "curl",
    "-sS",
    "-o",
    "/dev/null",
    "-w",
    shellQuote("%{http_code}\\t%{redirect_url}"),
    "-H",
    shellQuote("Host: blog.hadream.ltd"),
    shellQuote(url),
  ].join(" ");
  const output = execFileSync(
    "ssh",
    [
      "-o",
      `UserKnownHostsFile=${knownHosts}`,
      "-o",
      "StrictHostKeyChecking=yes",
      "websp.hadream.local",
      remoteCommand,
    ],
    { encoding: "utf8" },
  ).trim();

  const [status, location = ""] = output.split("\t");
  results.push({
    ...check,
    status,
    location,
    ok: status === "301" && location === check.expected,
  });
}

const failures = results.filter((result) => !result.ok);
const report = [
  "# Origin Redirect Verification",
  "",
  `- Checked: ${results.length}`,
  `- Passed: ${results.length - failures.length}`,
  `- Failed: ${failures.length}`,
  "",
  "## Failures",
  "",
  failures.length
    ? failures
        .map(
          (failure) =>
            `- ${failure.label}: ${failure.path} returned ${failure.status} -> ${failure.location}; expected ${failure.expected}`,
        )
        .join("\n")
    : "- None",
  "",
].join("\n");

await writeFile(path.join(taskDir, "origin-redirect-verification.md"), report);

console.log(report);

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

function shellQuote(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
