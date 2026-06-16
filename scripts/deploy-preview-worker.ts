// 因为要让 pages 的 API 地址以及 worker 的跨域策略正确
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

function readPullRequestNumber(): number | undefined {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    return undefined;
  }

  const event = JSON.parse(readFileSync(eventPath, "utf8")) as {
    pull_request?: { number?: number };
    number?: number;
  };

  return event.pull_request?.number ?? event.number;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const pullRequestNumber = readPullRequestNumber();
const branchName =
  process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || "preview";
const suffix = pullRequestNumber
  ? `pr-${pullRequestNumber}`
  : slugify(branchName) || "preview";
const workerName = `lanzhijiang-${suffix}`;
const workersSubdomain =
  process.env.CLOUDFLARE_WORKERS_SUBDOMAIN || "lanzhijiang";
const apiOrigin = `https://${workerName}.${workersSubdomain}.workers.dev`;

execFileSync(
  "pnpm",
  [
    "exec",
    "wrangler",
    "deploy",
    "--config",
    "wrangler.worker.toml",
    "--name",
    workerName,
    "--tag",
    `sha-${process.env.GITHUB_SHA}`,
    "--message",
    `repo=${process.env.GITHUB_REPOSITORY} ref=${process.env.GITHUB_REF_NAME}; actor=${process.env.GITHUB_ACTOR}; run=${process.env.GITHUB_RUN_ID}`,
  ],
  { stdio: "inherit" },
);

if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, `VITE_API_ORIGIN=${apiOrigin}\n`);
  appendFileSync(process.env.GITHUB_ENV, `PREVIEW_WORKER_NAME=${workerName}\n`);
}

console.log(`Preview Worker: ${workerName}`);
console.log(`VITE_API_ORIGIN=${apiOrigin}`);
