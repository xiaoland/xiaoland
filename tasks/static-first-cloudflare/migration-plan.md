# Migration Plan

## Phase 0: Inventory

- 盤點現有 route：
  - `/`
  - `/article/:slug`
  - `/comments/:slug`
- 盤點所有 Markdown frontmatter 欄位。
- 盤點圖片引用方式與 URL 規則。
- 確認目前 HTMX partial rendering 的實際需求。
- 確認 comments / D1 schema 的 runtime contract。

交付物：

- route inventory
- content metadata inventory
- asset path risk list

## Phase 1: Extract pure site rendering

目標是讓 HTML rendering 不依賴 Hono request context。

工作：

- 將 Markdown parsing 從 `src/utils/markdown.ts` 抽成可被 Node build script 使用的模組。
- 將 `homePage`、`articlePage`、`layout` 保持為純函式。
- 建立統一的 `Article` / `Page` / `SiteRoute` 型別。
- 移除 build-time 與 runtime 混雜的假設，例如直接依賴 `import.meta.glob` 作為唯一內容來源。

交付物：

- `src/site/content.ts`
- `src/site/render.ts`
- 基礎 unit tests

## Phase 2: Build static output

工作：

- 新增 `src/ssg/app.ts`。
- 設定 `@hono/vite-ssg`。
- 產生 `dist/index.html`。
- 產生 `dist/article/<slug>.html`。
- 產生 authored pages，例如 `dist/about.html`、`dist/me.html`。
- 複製 `public/` 靜態資源到 `dist/`。
- 產生 `dist/404.html`。
- 建立 build-time image mirroring step，處理 allowlisted remote images。

交付物：

- `pnpm build:static`
- `dist/` 可被本地 static server 直接預覽
- mirrored images 可隨 `dist/` 一起部署

## Phase 3: Feed, sitemap, search index

工作：

- 產生 `rss.xml` 或 `feed.xml`。
- 產生 `sitemap.xml`。
- 產生 `search-index.json`。
- 決定搜尋策略：簡單 JSON + client search，或引入 Pagefind。

交付物：

- feed snapshot test
- sitemap snapshot test
- search index schema

## Phase 3.5: Remote image mirroring hardening

工作：

- 設計 image host allowlist。
- 建立 build lifetime cache，避免單次 build 內重複下載。
- 不在第一階段引入 persistent cache 或 Git-tracked manifest。
- 限制 protocol、redirect、content type、file size、timeout。
- 決定 SVG 是否禁用或只允許可信來源。
- 支援 Markdown body images；後續再支援 cover / OG images。

交付物：

- image mirroring module
- in-memory record schema
- failure policy tests

## Phase 4: Split Worker API

工作：

- 將 `src/index.ts` 的公開頁面 SSR route 移出 Worker runtime。
- 新增或改為 `src/worker/index.ts`，只保留 API route。
- comments route 改為明確的 HTMX fragment 或 JSON endpoint。
- 修正目前 comments route 中未定義的 `comment` 變數問題。
- 釐清 D1 binding 命名，讓 `wrangler.toml` 與 TypeScript binding 一致。

交付物：

- `/api/*` Hono app
- API tests
- Worker route smoke test

## Phase 5: Cloudflare deployment

工作：

- Cloudflare Pages 指向 `dist/`。
- Worker route 只匹配 `/api/*` 或指定 dynamic paths。
- 設定 preview / production 環境變數。
- 決定是否使用 `_routes.json`。
- 更新 package scripts。

交付物：

- `pnpm build`
- `pnpm deploy:pages`
- `pnpm deploy:worker`
- deployment notes

## Phase 6: Hardening

工作：

- 對 dynamic endpoints 加 rate limit / Turnstile。
- 設定 cache headers。
- 檢查 404 / canonical / trailing slash 行為。
- 檢查 RSS、sitemap、OG metadata。
- 以爬蟲流量模型檢查是否仍會觸發 Worker。

交付物：

- verification report
- production rollback notes
