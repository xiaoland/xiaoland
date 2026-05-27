# Dynamic Surface

## 原則

動態能力不是被移除，而是被限制在清楚、可防護、可觀測的 surface 內。

公開文章頁不應依賴 Worker request 產生；Worker 只應處理「有狀態、需要驗證、需要寫入、需要即時資料」的部分。

## Endpoint 分類

### Public read, cheap

可接受公開訪問，但必須低成本：

- `GET /api/fragments/comments/:slug`
- `GET /api/reactions/:slug`
- `GET /api/site-status`

策略：

- 儘量回傳小 HTML fragment 或 JSON。
- 可加短 TTL cache。
- 對高頻 slug 設 stale fallback。

### Public write

需要防濫用：

- `POST /api/comments/:slug`
- `POST /api/reactions/:slug`
- `POST /api/contact`
- `POST /api/newsletter`

策略：

- Turnstile。
- IP / fingerprint / cookie based rate limit。
- payload schema validation。
- D1 write error fallback。

### Private / admin

不應被 crawler 掃到，也不應與公開 HTML 混在一起：

- `GET /api/preview/:slug`
- `POST /api/rebuild`
- `GET /api/admin/*`

策略：

- token / session auth。
- 不暴露在 sitemap。
- 嚴格 cache-control。

## HTMX fragments

建議命名：

```txt
GET /api/fragments/recent-activity
GET /api/fragments/home-status
GET /api/fragments/article-comments/:slug
GET /api/fragments/reaction-bar/:slug
GET /api/fragments/newsletter-box
```

回應策略：

- HTMX endpoint 可檢查 `HX-Request: true`，但安全性不可依賴這個 header。
- 非 HTMX 請求可以回 404 或 JSON error。
- fragment HTML 不應包含完整 layout。

## Comments 初步設計

靜態文章頁中保留 comments container：

```html
<section
  id="comments"
  hx-get="/api/fragments/article-comments/my-slug"
  hx-trigger="revealed"
  hx-swap="innerHTML"
></section>
```

這樣文章主體仍是靜態 HTML，只有留言區進 Worker。

## Authored page fragments

Home/About/Me 這類 authored pages 可以有自己的 HTMX fragment slots，但 fragment slot 不改變頁面來源型別。

例如首頁可以有：

```html
<section
  id="recent-activity"
  hx-get="/api/fragments/recent-activity"
  hx-trigger="revealed"
  hx-swap="innerHTML"
></section>
```

頁面本體仍由 `src/pages/home.ts` 在 build time 產生；fragment 由 Worker runtime 提供。

## 不放進 Worker 的內容

- article body
- article list
- about page
- CSS / JS / image assets
- RSS / sitemap
- search index

除非是 private preview，否則公開內容不應透過 Worker SSR 回應。
