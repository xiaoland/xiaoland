export interface LayoutProps {
  title: string;
  body: string;
}

export function layout({ title, body }: LayoutProps): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://unpkg.com/htmx.org@2.0.4" integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
  <link rel="stylesheet" href="/uno.css" />
  <link rel="stylesheet" href="/assets/variables.css" />
  <link rel="stylesheet" href="/assets/global.css" />
  <link rel="stylesheet" href="/assets/article.css" />
  <link rel="stylesheet" href="/assets/home.css" />
</head>
<body hx-boost="true">
  <main id="main-content">
    ${body}
  </main>
</body>
</html>`;
}
