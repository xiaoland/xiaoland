import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type MirroredImageRecord = {
  sourceUrl: string;
  localPath: string;
};

const maxImageBytes = 20 * 1024 * 1024;
const blockedHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export async function mirrorImagesInHtml({
  html,
  distDir,
  allowedHosts,
  cache,
}: {
  html: string;
  distDir: string;
  allowedHosts: Set<string>;
  cache: Map<string, MirroredImageRecord>;
}): Promise<string> {
  if (!allowedHosts.size) {
    return html;
  }

  const imageSources = [
    ...html.matchAll(/<img\b[^>]*\bsrc=(["'])(https:\/\/[^"']+)\1/gi),
  ]
    .map((match) => match[2])
    .filter((value, index, values) => values.indexOf(value) === index);

  let rewritten = html;
  for (const sourceUrl of imageSources) {
    const source = new URL(sourceUrl);
    if (!allowedHosts.has(source.hostname)) {
      continue;
    }

    const mirrored = await mirrorImage({
      sourceUrl,
      distDir,
      allowedHosts,
      cache,
    });
    rewritten = rewritten.replaceAll(sourceUrl, mirrored.localPath);
  }

  return rewritten;
}

export async function mirrorHtmlFile({
  filePath,
  distDir,
  allowedHosts,
  cache,
}: {
  filePath: string;
  distDir: string;
  allowedHosts: Set<string>;
  cache: Map<string, MirroredImageRecord>;
}): Promise<void> {
  const html = await readFile(filePath, "utf8");
  const rewritten = await mirrorImagesInHtml({
    html,
    distDir,
    allowedHosts,
    cache,
  });

  if (rewritten !== html) {
    await writeFile(filePath, rewritten);
  }
}

async function mirrorImage({
  sourceUrl,
  distDir,
  allowedHosts,
  cache,
}: {
  sourceUrl: string;
  distDir: string;
  allowedHosts: Set<string>;
  cache: Map<string, MirroredImageRecord>;
}): Promise<MirroredImageRecord> {
  const cached = cache.get(sourceUrl);
  if (cached) {
    return cached;
  }

  console.log(`Mirroring image: ${sourceUrl}`);

  const response = await fetch(sourceUrl, {
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to download image ${sourceUrl}: ${response.status}`,
    );
  }

  const finalUrl = new URL(response.url);
  if (finalUrl.protocol !== "https:" || !allowedHosts.has(finalUrl.hostname)) {
    throw new Error(
      `Unsafe image redirect from ${sourceUrl} to ${response.url}`,
    );
  }
  if (isBlockedHost(finalUrl.hostname)) {
    throw new Error(`Blocked image host: ${finalUrl.hostname}`);
  }

  const contentType =
    response.headers.get("Content-Type")?.split(";")[0]?.trim() ?? "";
  if (!contentType.startsWith("image/") || contentType === "image/svg+xml") {
    throw new Error(
      `Unsupported image content type for ${sourceUrl}: ${contentType || "unknown"}`,
    );
  }

  const contentLength = Number(response.headers.get("Content-Length") ?? "0");
  if (contentLength > maxImageBytes) {
    throw new Error(`Image is too large: ${sourceUrl}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > maxImageBytes) {
    throw new Error(`Image is too large: ${sourceUrl}`);
  }

  const urlHash = createHash("sha256")
    .update(sourceUrl)
    .digest("hex")
    .slice(0, 20);
  const extension =
    extensionForContentType(contentType) ??
    extensionFromPath(finalUrl.pathname) ??
    "bin";
  const localPath = `/images/mirrored/${urlHash}.${extension}`;
  const outputPath = path.join(distDir, localPath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, bytes);

  const record = {
    sourceUrl,
    localPath,
  };
  cache.set(sourceUrl, record);
  return record;
}

function isBlockedHost(hostname: string): boolean {
  return blockedHosts.has(hostname) || hostname.startsWith("169.254.");
}

function extensionForContentType(contentType: string): string | null {
  switch (contentType) {
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

function extensionFromPath(pathname: string): string | null {
  const extension = path.extname(pathname).replace(".", "").toLowerCase();
  return extension || null;
}
