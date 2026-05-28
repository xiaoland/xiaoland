export interface LayoutProps {
  title: string;
  description?: string;
  canonicalUrl?: string;
  body: string;
  assets?: {
    styles?: string[];
    scripts?: Array<{
      src: string;
      defer?: boolean;
      type?: "module" | "text/javascript";
    }>;
  };
}

export function layout({ title, description, canonicalUrl, body, assets }: LayoutProps): string {
  const styles = assets?.styles ?? [];
  const scripts = assets?.scripts ?? [];
  const metadata = [
    description ? `<meta name="description" content="${escapeHtmlAttribute(description)}" />` : "",
    canonicalUrl ? `<link rel="canonical" href="${escapeHtmlAttribute(canonicalUrl)}" />` : "",
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtmlText(title)}</title>
  ${metadata.join("\n  ")}
  <script src="https://unpkg.com/htmx.org@2.0.4" integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+" crossorigin="anonymous" defer></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
  ${styles.map((href) => `<link rel="stylesheet" href="${href}" />`).join("\n  ")}
  ${scripts
    .map(
      (script) =>
        `<script src="${script.src}"${script.defer ? " defer" : ""}${script.type ? ` type="${script.type}"` : ""}></script>`,
    )
    .join("\n  ")}
</head>
<body hx-boost="true">
  <main id="main-content">
    ${body}
  </main>
</body>
</html>`;
}

function escapeHtmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtmlText(value)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
