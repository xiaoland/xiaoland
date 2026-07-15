import { defineConfig, type Plugin, type UserConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import Sitemap from "vite-plugin-sitemap";
import { readdir, copyFile } from "node:fs/promises";
import { mirrorHtmlFile } from "./scripts/image-mirroring";
import { fileURLToPath } from "node:url";
import { readdirSync } from "node:fs";
import path from "node:path";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const publicDir = path.resolve(rootDir, "public");
const distDir = path.resolve(rootDir, "dist");

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

function postbuildPlugin(): Plugin {
  return {
    name: "xiaoland-postbuild",
    apply: "build",

    async closeBundle() {
      const distDir = new URL("./dist", import.meta.url).pathname;
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
    },
  };
}

function collectHtmlInputs(dir: string): Record<string, string> {
  const input: Record<string, string> = {};

  function walk(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && path.extname(entry.name) === ".html") {
        const name = path.relative(publicDir, fullPath).replace(/\.html$/, "");
        input[name] = fullPath;
      }
    }
  }

  walk(dir);
  return input;
}

function otherStaticFiles(): Plugin {
  return {
    name: "copy-redirects",
    apply: "build",
    async closeBundle() {
      for (const file of ["_redirects", "robots.txt", "ads.txt"]) {
        await copyFile(
          path.resolve("public", file),
          path.resolve("dist", file),
        );
      }
    },
  };
}

const devServerHost = process.env.HOST;
const devServerPort = process.env.PORT
  ? Number.parseInt(process.env.PORT, 10)
  : undefined;

export default defineConfig((): UserConfig => {
  const server = {
    host: devServerHost,
    port: devServerPort,
    proxy: {
      "/api": "https://api.xiaoland.localhost",
    },
  };

  return {
    root: "public",
    publicDir: false,
    server: {
      ...server,
      watch: {
        ignored: ["!**/public/**"],
      },
    },
    build: {
      outDir: distDir,
      emptyOutDir: true,
      rolldownOptions: {
        input: collectHtmlInputs(publicDir),
      },
    },
    plugins: [
      cloudflare(),
      otherStaticFiles(),
      postbuildPlugin(),
      Sitemap({
        hostname: "https://lanzhijiang.dev",
        outDir: distDir,
        generateRobotsTxt: false,
        exclude: [],
      }),
    ],
  };
});
