export interface LayoutProps {
  title: string;
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

export function layout({ title, body, assets }: LayoutProps): string {
  const styles = assets?.styles ?? [];
  const scripts = assets?.scripts ?? [];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
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
