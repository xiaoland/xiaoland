# Verification

## Local checks

- `pnpm run check`
- `pnpm run preview:static` 可打開 `dist/index.html`。
- 所有文章 URL 回 200。
- 隨機抽樣文章圖片可載入。
- allowlisted remote images 被輸出到 `dist/images/mirrored/`。
- allowlisted remote images 的 HTML `src` 被改寫為本地靜態路徑。
- non-allowlisted remote images 保持原 URL，且 build 不 warning。
- CSS 路徑正確。
- HTMX fragment container 不阻塞文章主體閱讀。

## Automated checks

建議測試層級：

- Markdown frontmatter parsing unit tests。
- Article sorting tests。
- Hono SSG route generation tests。
- RSS snapshot tests。
- Sitemap snapshot tests。
- Search index schema tests。
- Worker API route tests。
- Image mirroring allowlist tests。
- Image mirroring build lifetime dedup tests。
- CI workflow only orchestrates repo scripts; no long inline shell blocks。

## Deployment checks

- 首頁從 Pages 靜態資產回應。
- 文章頁不觸發 Worker。
- 圖片不觸發 Worker。
- mirrored images 存在於當前 Pages deployment 的 `dist/` 產物內。
- `/api/*` 才觸發 Worker。
- 404 行為符合預期。
- RSS / sitemap 可被 crawler 讀取。

## Manual browser checks

- 首頁。
- 最新文章頁。
- 舊文章頁。
- About page。
- 留言區 lazy load。
- 手機 viewport。
- 無 JavaScript 時文章主體仍可閱讀。

## Regression risks

- Markdown frontmatter parser 目前是自製 parser，遇到更完整 YAML 語法可能有風險。
- 圖片相對路徑在靜態輸出後可能失效。
- HTMX fragment route 目前只做了 comments 的最小切片，後續擴張 API 時要補防濫用策略。

## Done definition

- `dist/` 可完整承載公開站點。
- Worker 只處理 dynamic routes。
- 部署後公開頁面請求不依賴 Worker SSR。
- 主要內容在 JS disabled 情況下仍可閱讀。
- API endpoint 有基本防濫用策略。
- rollback path 清楚。
