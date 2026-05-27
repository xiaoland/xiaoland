# Architecture

## 核心模型

站點應該改成「靜態內容優先，動態能力旁路」：

```txt
content/articles/*.md
src/pages/*
public/*
src/templates/*
src/client/*
        |
        v
Hono SSG / Vite build
        |
        +--> dist/index.html
        +--> dist/article/<slug>.html
        +--> dist/about.html
        +--> dist/rss.xml
        +--> dist/sitemap.xml
        +--> dist/search-index.json
        +--> dist/assets/*
        +--> dist/uno.css
        +--> dist/images/*
        |
        v
Cloudflare Pages

/api/*, /comments/*, /preview/*, /admin/* -> Cloudflare Worker + Hono
```

公開頁生成使用 Hono SSG。Hono 同時承擔 build-time static route rendering 與 runtime dynamic API，但兩者應拆成不同 app entry，避免公開頁 SSR 回到 Worker runtime。

## 邊界

### Static layer

負責所有公開、可快取、可預先計算的內容：

- authored pages，例如 Home / About / Me
- article pages
- archive / tags / feed
- RSS / Atom
- sitemap
- search index
- CSS / JS / fonts / images
- 404 page

圖片可來自兩種來源：

- 已在 `public/` 的本地圖片，直接複製到 `dist/`。
- Markdown 中來自 allowlisted image hosts 的 `https` 圖片，在 build time 下載並鏡像到 `dist/`，HTML 產物改寫為本地靜態路徑。

### Dynamic layer

只處理無法安全或合理靜態化的行為：

- comments
- reactions
- analytics ingestion
- newsletter / contact form
- admin-only preview
- rebuild webhook
- Turnstile / rate limiting
- HTMX dynamic fragments

## 部署拓撲

首選：

```txt
xiaoland.example/*      -> Cloudflare Pages static assets
xiaoland.example/api/*  -> Cloudflare Worker
```

理由：

- 同域 API 對 HTMX、cookie、CORS 最簡單。
- Pages 靜態部署語義清楚。
- Worker request surface 可被 `_routes.json` 或 Cloudflare route 明確限制。
- 未來要把 Worker 換成 service binding 或獨立子域仍有空間。

備選：

```txt
single Worker
  static assets hit -> asset response
  unmatched /api/*  -> Hono
```

這適合後續希望單一部署單元時再評估，不建議作為第一步，因為會讓遷移邊界比較不直觀。

## 程式碼分層建議

```txt
src/site/
  content.ts       # 讀取與整理 article Markdown content
  markdown.ts      # frontmatter + Markdown render
  render.ts        # authored page / article render API

src/pages/
  home.ts          # authored raw HTML page definition
  about.ts         # authored raw HTML page definition
  me.ts            # authored raw HTML page definition, if needed
  article.ts       # article route factory

src/templates/
  layout.ts
  home.ts
  article.ts
  ...

src/fragments/
  article-comments.ts
  ...              # runtime fragment renderers

src/worker/
  index.ts         # Hono API only

src/ssg/
  app.ts           # Hono SSG public app

scripts/
  postbuild-static.ts  # optional; non-page artifacts or post-processing
```

重點是讓 authored pages、article templates 與 content logic 成為純函式，Hono SSG routes 可以在 build time 調用並輸出 HTML；Worker 不再承擔公開頁 SSR。

`content/` 只保存文章 Markdown 來源。Home/About/Me 這類 authored pages 放在 `src/pages/`，直接以 raw HTML/TS renderer 維護，不讀 `content/pages/*`。

## Assets

資源管線分成兩層：

- `public/`：copy-only assets，例如圖片、字型、手寫 CSS、favicon、robots.txt。
- Vite / existing tooling：處理需要生成或打包的 CSS/JS，例如 UnoCSS、`@hono/vite-ssg` 或未來的 client entry。

Hono SSG / Vite build 負責把公開頁與 assets 放進同一個 build pipeline。不要另寫 CSS/JS bundler。

## HTMX 策略

HTMX 仍可保留，但用途應轉為 dynamic islands：

- 初始頁面由靜態 HTML 提供。
- 局部互動透過 `hx-get="/api/fragments/..."` 載入。
- fragment endpoint 必須可被 rate limit。
- fragment response 不應包含主文章內容。

## Anti-crawler 策略

靜態化本身不能阻止爬蟲，但可以降低爬蟲造成的 Worker 成本。動態 endpoint 需要另外處理：

- 僅 `/api/*` 進 Worker。
- 對寫入 endpoint 加 Turnstile。
- 對讀取型 dynamic endpoint 設快取與低成本 fallback。
- 對 expensive endpoint 加 rate limit。
- 不把公開文章內容放在 Worker path。

## Remote image mirroring

Markdown 可以繼續使用來源清楚的遠端圖片 URL：

```md
![alt](https://images.example.com/articles/foo.jpg)
```

build pipeline 只處理 allowlist domain 內的圖片：

```txt
remote image URL -> validate -> fetch -> dist/images/mirrored/... -> rewrite rendered HTML
```

非 allowlist 的圖片保持原 URL，不報 warning。這讓外部資源語義保持清楚，也避免把第三方圖片無意鏡像到站點產物。
