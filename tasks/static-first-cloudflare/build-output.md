# Build Output

## 目標輸出

```txt
dist/
  index.html
  404.html
  article/
    <slug>.html
  about.html
  me.html
  assets/
    global.css
    article.css
    home.css
    ...
    client-<hash>.js
  uno.css
  images/
    articles/
      ...
    mirrored/
      <hash>.<ext>
  rss.xml
  sitemap.xml
  search-index.json
```

## URL 策略

建議保留目前文章 URL 風格：

```txt
/article/<slug>
```

靜態輸出可落在：

```txt
dist/article/<slug>.html
```

這能兼容 trailing slash 與大部分靜態托管 fallback 行為。

Authored pages 使用普通靜態頁路徑：

```txt
/          -> dist/index.html
/about     -> dist/about.html
/me        -> dist/me.html
```

Home/About/Me 的 source 放在 `src/pages/*`，不是 `content/pages/*`。

## Asset 策略

第一階段不做 aggressive image pipeline，先保留既有 `public/images/articles/...` 路徑。

`public/` 下 copy-only assets 直接複製到 `dist/`。Hono SSG 不負責 bundle CSS/JS；Vite 負責資產圖，SSG routes 只負責在 layout 中引用最後的 asset URLs。

Markdown 中 allowlisted remote images 由 build step 下載到：

```txt
dist/images/mirrored/<url-hash>.<ext>
```

rendered HTML 會把原始 `https` 圖片 URL 改寫為本地靜態路徑。不在 allowlist 的圖片保持原樣，不 warning、不下載、不改寫。

可後續再評估：

- image manifest
- responsive image variants
- content hash
- AVIF / WebP
- Cloudflare Images

## Client bundle

客戶端程式碼應在 build time 打包。

候選方案：

- 繼續使用 Vite 打包 client entry。
- 保留 Alpine.js 作為靜態頁的互動層。
- HTMX 可作為 vendor script 或 bundled dependency。

不建議第一階段把所有 client behavior 重寫成 SPA。

## Search index

最低可行版本：

```json
[
  {
    "slug": "example",
    "url": "/article/example",
    "title": "Example",
    "description": "Short description",
    "createdAt": "2026-01-01"
  }
]
```

如果需要全文搜尋，再加入 plain text excerpt 或改用 Pagefind。

## Cache headers

建議方向：

- HTML: short or deployment-controlled cache。
- hashed assets: long cache。
- images: long cache。
- RSS / sitemap: short cache。
- API fragments: endpoint-specific TTL。

Cloudflare Pages 的部署模型已適合靜態資產快取，第一階段不要過度手寫 cache rule。
