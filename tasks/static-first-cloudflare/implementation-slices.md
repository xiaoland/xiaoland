# Implementation Slices

## 原則

每個 slice 都應該能獨立驗證，並把風險控制在一個清楚邊界內。不要一次同時改 build system、runtime routes、image pipeline、部署設定與互動 API。

建議順序。這裡的 slice 是實作順序，不代表 production 會進入混合過渡狀態；公開站切換時應一次切到 static-first。

1. 先讓內容模型與 rendering 從 Worker runtime request 中解耦。
2. 再建立 Hono SSG app 並產生完整靜態 HTML。
3. 再處理圖片鏡像。
4. 再把 Worker 收斂成 API。
5. 最後切部署與防護策略。

## Slice 1: Site Core Extraction

目標：

- 建立可被 Hono SSG app 使用的 site core。
- 不引入公開頁 runtime SSR 作為長期路徑。

改動範圍：

- `src/utils/markdown.ts`
- `src/templates/*`
- 新增 `src/site/*`
- 新增 `src/pages/*`
- 測試檔

工作：

- 抽出 content loading、frontmatter parsing、article sorting。
- 定義 `ArticleMeta`、`Article`、`AuthoredPageRoute`、`ArticlePageRoute` 等共享型別。
- 將 Home/About/Me 這類 authored pages 放入 `src/pages/*`，不從 `content/pages/*` 讀取。
- 區分 content source types、page route types、dynamic fragment mounts。
- 讓 rendering API 不依賴 Hono context。
- 讓 public static Hono routes 可以直接調用 site core。

驗證：

- Hono SSG app 可枚舉 authored pages 與 article pages。
- article sorting 與 frontmatter parsing 有測試。

## Slice 2: Static HTML Builder

目標：

- 新增 Hono SSG build，產生可直接托管的 `dist/`。
- 使用 `@hono/vite-ssg`，不自建 custom page builder。
- 建立最小 assets pipeline：copy `public/`，並讓 layout 接收 asset refs。

改動範圍：

- 新增 `src/ssg/app.ts`
- `package.json`
- `vite.config.ts`
- 可能新增 preview script
- 測試檔

工作：

- 產生首頁 HTML。
- 產生 `article/<slug>.html`。
- 產生 authored pages，例如 `about.html`、`me.html`。
- 產生 `404.html`。
- 複製 `public/` 到 `dist/`。
- 保留既有 `public/assets/*.css` 與 `public/uno.css` 引用。
- 讓 route 可宣告 page-level CSS。
- 使用 `ssgParams` 產生 article dynamic routes。

驗證：

- `pnpm build:static` 或 `vite build` 成功。
- `dist/` 用本地 static server 可瀏覽。
- 抽樣文章、About、404 正常。

## Slice 3: Build-time Image Mirroring

目標：

- 讓 Markdown 中 allowlisted remote images 在 build 時輸出到 `dist/`。
- 不引入 persistent cache 或 Git-tracked manifest。

改動範圍：

- 新增 `src/site/image-mirroring.ts` 或 `scripts/image-mirroring.ts`
- `@hono/vite-ssg` build integration or postbuild hook
- 測試檔

工作：

- 掃描 rendered HTML 中的 `img[src]`。
- 只處理 allowlisted `https` URL。
- 非 allowlist URL 保持原樣，不 warning。
- 實作 build lifetime cache：`Map<sourceUrl, MirroredImageRecord>`。
- 驗證 protocol、redirect final host、content type、file size、timeout。
- 寫入 `dist/images/mirrored/<url-hash>.<ext>`。
- 改寫 HTML `src`。

驗證：

- 同一 URL 在一次 build 中只下載一次。
- allowlisted image 被改寫為本地路徑。
- non-allowlisted image 不改寫、不 warning。
- unsafe redirect / oversized / invalid content type 對 allowlisted URL fail build。

## Slice 4: Feed, Sitemap, Search Index

目標：

- 補齊靜態站需要的機器可讀輸出。

改動範圍：

- Hono SSG routes or postbuild hook
- 可能新增 `src/site/feed.ts`
- 可能新增 `src/site/sitemap.ts`
- 可能新增 `src/site/search.ts`
- 測試檔

工作：

- 產生 `rss.xml` 或 `feed.xml`。
- 產生 `sitemap.xml`。
- 產生 `search-index.json`。
- 搜尋第一階段只做 metadata index。

驗證：

- XML 基本合法。
- URL 與 canonical policy 一致。
- search index schema 穩定。

## Slice 5: Worker API Split

目標：

- 將公開 HTML serving 從 Worker runtime 移出。
- Worker/Hono 只保留動態 API。

改動範圍：

- `src/index.ts` 或新增 `src/worker/index.ts`
- `src/services/*`
- `src/db/*`
- `wrangler.toml`
- API tests

工作：

- 移除或停止使用 `/`、`/article/:slug` SSR routes。
- 保留 `/api/*` 或 `/api/fragments/*`。
- comments route 改成明確 HTMX fragment 或 JSON endpoint。
- 修正目前 comments route 中未定義的 `comment` 變數。
- 對 D1 binding 命名做一致化。

驗證：

- API route smoke tests。
- `/api/fragments/article-comments/:slug` 可回 fragment。
- 非 API 公開頁面不經 Worker。

## Slice 6: Deployment Split

目標：

- Pages 部署靜態站，Worker 部署 API。
- CI/CD workflow 只做編排，實際邏輯落在 repo scripts。

改動範圍：

- `package.json`
- `wrangler.toml`
- 可能新增 Pages config / `_routes.json`
- deployment docs in task packet

工作：

- 定義 Pages build command 與 output directory。
- 定義 Worker route，只匹配 `/api/*`。
- 拆分 scripts，例如 `build:static`、`deploy:pages`、`deploy:worker`。
- 確認 preview / production env。
- 新增薄 workflow：CI、preview deploy、production deploy。
- 新增 `scripts/verify-dist.ts`，避免把驗證邏輯寫進 workflow YAML。

驗證：

- Pages preview 可瀏覽完整靜態站。
- Worker 只被 `/api/*` 命中。
- rollback path 清楚。
- workflow YAML 沒有長 shell script。

## Slice 7: Hardening

目標：

- 補齊公開站與動態 API 的穩定性、防濫用與觀測。

改動範圍：

- API middleware
- Cloudflare config
- tests

工作：

- 對 public write API 加 Turnstile / rate limit。
- 設定 API cache-control。
- 檢查 404、canonical、trailing slash。
- 確認 no-JS 閱讀體驗。
- 補 deployment checklist。

驗證：

- 爬蟲訪問公開頁面不觸發 Worker。
- write endpoints 有防濫用。
- 無 JS 時文章主體可讀。

## Recommended first PR

第一個 PR 建議包含 Slice 1 + enough of Slice 2 to prove the static path：

- 抽出 site core。
- 建立 `src/ssg/app.ts`。
- 透過 `@hono/vite-ssg` 產出最小 `dist/`。
- 補最小測試。

理由：

- 風險最低。
- 後續圖片、feed、部署都能接在同一條 static path 上。
- 不製造公開頁 SSR 與 SSG 長期並存的架構。

## Dependency Graph

```txt
Slice 1 Site Core Extraction
  -> Slice 2 Static HTML Builder
      -> Slice 3 Image Mirroring
      -> Slice 4 Feed / Sitemap / Search
          -> Slice 6 Deployment Split

Slice 5 Worker API Split
  -> Slice 6 Deployment Split

Slice 6 Deployment Split
  -> Slice 7 Hardening
```
