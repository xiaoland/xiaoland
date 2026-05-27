# Image Mirroring

## 背景

圖片靜態托管有利於速度、成本與抗爬蟲成本控制，但把大量大二進位檔案直接放進 Git 不理想。

採用 build-time image mirroring：

- Markdown 中仍使用 `https` 圖片連結。
- build 時只下載 allowlisted domains 的圖片。
- 下載後輸出到 `dist/images/mirrored/`。
- rendered HTML 中的 `img src` 改寫為本地靜態路徑。
- 非 allowlist 圖片保持原 URL，不 warning。

## Pipeline

```txt
Markdown content
  -> Markdown render
  -> scan rendered HTML img[src]
  -> filter allowlisted https URLs
  -> validate remote response
  -> download or reuse build lifetime cache
  -> write dist/images/mirrored/<hash>.<ext>
  -> rewrite HTML img[src]
```

建議放在 build 階段，不混進 Markdown parser。Markdown parser 負責內容語義；image mirroring 負責輸出產物轉換。

## Allowlist

只允許明確列出的圖片來源，例如：

```txt
images.xiaoland.example
cdn.xiaoland.example
oss.xiaoland.example
```

規則：

- 只處理 `https:`。
- domain 必須精確匹配或符合明確設定的子域規則。
- redirect 後的 final URL 仍必須在 allowlist。
- 非 allowlist URL 保持原樣，不下載、不改寫、不 warning。

## Metadata and manifest

第一階段不需要把 manifest 納入 Git。

如果只採用 build lifetime cache，映射資料只需要活在單次 build process 內：

```ts
type MirroredImageRecord = {
  sourceUrl: string;
  localPath: string;
  urlHash: string;
  contentHash: string;
  contentType: string;
};
```

這足以支援：

- 同一 URL 在單次 build 內去重。
- HTML rewrite。
- build log / debug output。
- 單次 build 內的一致性。

持久化 manifest 只有在引入 persistent build cache 或 conditional request 時才有明確價值。若未採用 persistent cache，manifest 進 Git 的收益不足，還會增加維護成本。

未來如需要 persistent cache，再設計 manifest，例如：

```json
{
  "https://images.xiaoland.example/foo.jpg": {
    "localPath": "/images/mirrored/url-sha256.jpg",
    "urlHash": "url-sha256",
    "contentHash": "content-sha256",
    "contentType": "image/jpeg",
    "etag": "\"example-etag\"",
    "lastModified": "Wed, 01 Jan 2025 00:00:00 GMT",
    "fetchedAt": "2026-05-27T00:00:00.000Z"
  }
}
```

persistent manifest 的用途：

- 讓同一個遠端 URL 對應穩定的本地輸出路徑。
- 支援 conditional request，例如 `If-None-Match` / `If-Modified-Since`。
- 讓 build log 可以知道哪些圖片被新增、重用或更新。

manifest 本身不等於圖片 cache。若 build environment 是全新環境，只有 manifest 但沒有實際圖片檔，仍然需要重新下載圖片。

## Cache model

需要區分兩種 cache：

- build lifetime cache：單次 build process 內的暫存，用來避免同一 URL 在同一次 build 中被重複下載或重複處理。
- persistent build cache：跨 build 保存的圖片實體檔，用來加速後續 build、降低來源圖床流量，並可在來源短暫不可用時兜底。第一階段不採用。

兩者都不是 Cloudflare Pages 舊部署的能力。

build lifetime cache 可存在於：

- process memory。
- build temp directory。

persistent build cache 若未來採用，可存在於：

- 本機 `.cache/xiaoland/images/`。
- CI cache，例如 GitHub Actions cache。
- 專門的 build artifact cache。
- 後續如有需要，可用 R2 作為 build cache source。

Cloudflare Pages 的每次部署都是新的靜態輸出集合。當 HTML 引用 `/images/mirrored/foo.jpg` 時，該檔案必須存在於本次 `dist/`。不能假設舊 deployment 中的圖片會自動為新 deployment 服務。

因此 build step 應該遵守：

- 如果 build lifetime cache 已處理過同一 URL，直接重用該次 build 的結果。
- 如果 build lifetime cache 沒有該 URL，從遠端下載。
- 如果遠端下載失敗，allowlisted 圖片應讓 build fail。
- 不依賴舊 Cloudflare Pages deployment，也不依賴跨 build 的圖片 cache。

## Why cache exists

build lifetime cache 的作用：

- 避免同一圖片 URL 在同一次 build 中被多篇文章或多個欄位重複下載。
- 讓 HTML rewrite、metadata extraction、hash calculation 等處理結果可重用。
- 保持單次 build 內的輸出一致性。

persistent build cache 的作用：

- 減少跨 build 的圖片下載時間。
- 降低自有圖床、OSS 或 CDN 的 origin 流量。
- 降低被 rate limit 或網路抖動影響 build 的機率。
- 在來源圖片短暫不可用但舊檔仍可信時兜底。
- 配合 manifest 做 conditional request，避免遠端內容未變時下載完整檔案。

第一階段只採用 build lifetime cache。persistent build cache 的收益要等圖片數量、build 時間、圖床流量或失敗率真的成為問題時再引入。

## Persistent cache upgrade criteria

符合以下任一情況時，再評估 persistent build cache：

- 圖片下載佔據 build 時間的主要部分。
- 圖床或 OSS 的 build-time 流量開始有明顯成本。
- CI 或 Pages build 因網路抖動頻繁失敗。
- 遠端圖片數量大到每次全量下載不合理。
- 需要 conditional request 降低遠端下載量。

## File naming

建議第一階段用 URL hash：

```txt
dist/images/mirrored/<sha256-url>.<ext>
```

理由：

- Markdown URL 不變時，本地路徑穩定。
- HTML diff 較小。
- manifest 可另外記錄 content hash，用於偵測遠端內容是否變動。

若後續更重視 immutable cache，可改成 content hash 或加上 versioned query，但第一階段不必複雜化。

## Validation

下載前後需要限制：

- protocol: only `https:`
- timeout: 有明確上限
- max size: 例如 10MB 或 20MB
- content type: `image/*`
- redirect: final URL 仍在 allowlist
- private network: 禁止 localhost、private IP、metadata IP
- SVG: 預設不處理，或只允許可信來源且做額外 sanitization

## Failure policy

- allowlisted image 首次下載失敗且無 cache：build fail。
- allowlisted image 下載失敗：build fail。
- non-allowlisted image：保持原 URL，不 warning。
- invalid content type / oversized file / unsafe redirect：build fail for allowlisted URL。

## Scope

第一階段支援：

- Markdown body 中的 `img[src]`。
- rendered HTML rewrite。
- allowlist。
- build lifetime cache。

延後：

- persistent build cache。
- persistent manifest。
- conditional request。
- `srcset`。
- cover image。
- OG image。
- responsive variants。
- AVIF / WebP conversion。
- Cloudflare Images。
