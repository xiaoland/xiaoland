# Static-first Cloudflare Migration

## 背景

目前站點以 Cloudflare Worker + Hono 在請求時產生 HTML，文章內容來自本地 Markdown，圖片與靜態資源放在 `public/`。這個模型簡潔，但公開文章流量、爬蟲流量與靜態內容請求仍會更容易牽涉 Worker runtime。

本任務的方向是把站點改成 static-first：

- 文章、authored pages、圖片、CSS、客戶端 JS、RSS、sitemap、搜尋索引在 build time 產生。
- 公開內容部署到 Cloudflare Pages 或 Workers Static Assets。
- 公開頁由 Hono SSG + raw HTML/CSS/JS 產生。
- Worker/Hono 保留為小而清楚的動態層，只處理 `/api/*`、HTMX fragments、寫入、驗證、私密 preview 等能力。

## 目標

- 降低公開內容流量對 Worker invocation 的依賴。
- 讓文章與圖片主要由 Cloudflare CDN 靜態托管承擔。
- 保留未來可以逐步加入互動功能的後端空間。
- 讓 build 流程、部署邊界、動態 API 邊界都可被測試與維護。

## 非目標

- 不引入獨立 CMS。
- 不把文章內容源從本地 Markdown 遷移到資料庫。
- 不把 Home、About、Me 這類 authored pages 放入 `content/`；它們直接由 raw HTML/TS renderer 定義。
- 不在第一階段實作 ISR、on-demand rebuild 或複雜增量構建。
- 不重做整站視覺設計。
- 不修改 `README.md`。

## 建議檔案閱讀順序

1. [architecture.md](./architecture.md)
2. [migration-plan.md](./migration-plan.md)
3. [implementation-slices.md](./implementation-slices.md)
4. [content-model.md](./content-model.md)
5. [hono-and-dev-workflow.md](./hono-and-dev-workflow.md)
6. [dynamic-surface.md](./dynamic-surface.md)
7. [build-output.md](./build-output.md)
8. [assets-pipeline.md](./assets-pipeline.md)
9. [image-mirroring.md](./image-mirroring.md)
10. [ci-cd.md](./ci-cd.md)
11. [verification.md](./verification.md)
12. [open-questions.md](./open-questions.md)

## 當前狀態快照

- Runtime 入口：`src/index.ts`
- HTML templates：`src/templates/*`
- Markdown parsing：`src/utils/markdown.ts`
- Authored pages：後續放入 `src/pages/*`，不放在 `content/pages/*`
- 靜態資源：`public/`
- 文章圖片：部分已在 `public/images/articles/`，後續可支援 build-time remote image mirroring
- 目前部署：`wrangler deploy`
- 目前 build：`unocss ... && vite build`

## 建議決策

採用 Hono SSG + raw HTML/CSS/JS 產生公開靜態站，由 Cloudflare Pages 承載；另以 Worker/Hono 承載 `/api/*` 動態能力。優先使用 `@hono/vite-ssg` 讓靜態生成進入 Vite build 流程。
