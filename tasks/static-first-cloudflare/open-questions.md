# Open Questions

## 需要先決策

1. 文章 URL 是否維持 `/article/<slug>`？

   建議維持，避免破壞既有連結。

2. Cloudflare Pages + separate Worker，還是單一 Worker Static Assets？

   建議第一階段選 Pages + separate Worker，邊界更直觀。

3. 搜尋要做到哪個層級？

   建議先做 metadata search index；全文搜尋等靜態化完成後再評估 Pagefind。

4. comments 是否是第一階段必須保留的互動？

   如果是，先把它做成 HTMX fragment；如果不是，可以先以靜態 placeholder 保留版位。

5. 是否需要 private preview？

   如果需要，preview 應走 Worker，不應影響公開靜態頁。

6. 圖片 allowlist 包含哪些 domain？

   建議只加入自有圖床、OSS bucket 或可控 CDN domain。

## 可以延後決策

- 是否引入 image optimization pipeline。
- 是否使用 Cloudflare Images。
- 是否把 R2 作為 build image cache source。
- 是否在圖片規模變大後引入 persistent build cache 與 manifest。
- 是否使用 KV / D1 / R2 儲存動態資料。
- 是否實作 rebuild webhook。
- 是否做文章全文 client search。
- 是否調整 URL trailing slash 策略。

## 我目前的偏好

- 保留 `/article/<slug>`。
- 使用 Cloudflare Pages 承載 `dist/`。
- Worker 只掛 `/api/*`。
- 靜態搜尋先簡單做，避免第一階段引入過多 moving parts。
- 留言與互動能力以 HTMX fragments 漸進恢復。
