# Minimal Migration Plan

This plan intentionally excludes Open Graph, Twitter Card, and Article JSON-LD.

## Sequence

```mermaid
sequenceDiagram
  participant G as Googlebot
  participant O as blog.hadream.ltd
  participant N as lanzhijiang.dev

  G->>O: crawl old article URL
  O-->>G: 301 Location: new article URL
  G->>N: crawl new article URL
  N-->>G: 200 HTML with canonical + description
  G->>N: crawl sitemap.xml / robots.txt
```

## Target Site Minimum Changes

1. Add explicit `public/robots.txt`.
   - Allow search crawlers.
   - Include `Sitemap: https://lanzhijiang.dev/sitemap.xml`.
   - Avoid appending fallback HTML.

2. Add Google verification file or meta.
   - Existing old verification file: `google0082311ca71e0e82.html`
   - The fastest low-risk path is adding the same file under `public/`.

3. Add minimal head metadata to layout.
   - Per page canonical URL.
   - Per page meta description.
   - Keep this generic and data-driven from existing article frontmatter.

AdSense runtime and legacy `ads.txt` migration are intentionally out of scope for this migration pass. The new site should be set up fresh in AdSense; the account verification meta can be added independently for that setup.

## Old Site Minimum Changes

1. Keep old site available long enough to serve redirects.
2. Add exact 301 redirects for all 81 article URLs in `old-url-map.csv`.
3. Add redirects for the old standalone pages:
   - `/index.php/about-page.html` -> `https://lanzhijiang.dev/about`
   - `/index.php/sub_blog.html` -> likely `https://lanzhijiang.dev/` unless a new equivalent page is planned.
4. Redirect old feed:
   - `/index.php/feed/` -> `https://lanzhijiang.dev/rss.xml`
5. Do not redirect every unknown old URL to the homepage.
   - Let truly missing URLs remain 404, or map only high-value category/tag archive pages to useful equivalents.

## Verification Commands

```bash
curl -I https://lanzhijiang.dev/sitemap.xml
curl -I https://lanzhijiang.dev/robots.txt
curl -I https://lanzhijiang.dev/google0082311ca71e0e82.html
curl -I https://blog.hadream.ltd/index.php/archives/451/
```

After redirects are deployed, expected old article response:

```txt
HTTP/2 301
location: https://lanzhijiang.dev/article/key-based-ssh-auth
```

## Google Console Manual Steps

1. Verify both old and new properties in Google Search Console.
2. Submit `https://lanzhijiang.dev/sitemap.xml`.
3. Use Search Console Change of Address after old redirects are live.
