import { readdir } from "node:fs/promises";
import path from "node:path";
import { mirrorHtmlFile } from "../image-mirroring.js";

const distDir = path.resolve("dist");
const allowedHosts = new Set(
  (process.env.MIRROR_IMAGE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
);

const cache = new Map<string, { sourceUrl: string; localPath: string }>();

for (const htmlFile of await findHtmlFiles(distDir)) {
  await mirrorHtmlFile({
    filePath: htmlFile,
    distDir,
    allowedHosts,
    cache,
  });
}

async function findHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findHtmlFiles(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
    }),
  );

  return files.flat();
}
