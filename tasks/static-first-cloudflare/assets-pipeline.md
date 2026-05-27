# Assets Pipeline

## Principle

Use a boring split:

- `public/` for static assets that should be copied as-is.
- Vite for CSS/JS that should be bundled, hashed or processed.
- Hono SSG for HTML generation.

Do not write a custom CSS/JS bundler.

## Asset classes

### Copy-only public assets

Source:

```txt
public/
  images/
  fonts/
  favicon.ico
  robots.txt
  ...
```

Build behavior:

- Copied to `dist/` as-is.
- Referenced by stable absolute paths such as `/images/...`.
- Suitable for images, fonts, icons and static files that do not need bundling.

### Generated CSS

Current UnoCSS output:

```txt
public/uno.css
```

Recommended first step:

- Keep generating `public/uno.css`.
- Copy it to `dist/uno.css`.
- Reference it from `layout`.

Later option:

- Move UnoCSS output into Vite-managed build output if asset hashing becomes important.

### Authored CSS

Current:

```txt
public/assets/variables.css
public/assets/global.css
public/assets/article.css
public/assets/home.css
```

Recommended first step:

- Keep these under `public/assets/`.
- Copy as-is to `dist/assets/`.
- Keep explicit links in `layout`.

This is acceptable because the site is small and CSS files are already hand-authored.

### Client JS

Recommended target:

```txt
src/client/
  main.ts
  htmx.ts
  alpine.ts
```

Build behavior:

- Bundle with Vite.
- Output to `dist/assets/client-<hash>.js`.
- Let Vite produce final client assets.
- `layout` receives final JS asset URLs from the SSG/build integration.

First implementation can stay simpler:

- Keep HTMX and Alpine as external CDN scripts, if acceptable.
- Or vendor them through Vite once we want stronger offline/reproducible builds.

## Build sequence

Recommended:

```txt
clean dist
  -> Vite build with @hono/vite-ssg
  -> build CSS/JS assets
  -> copy public assets
  -> render Hono SSG routes with final asset URLs
  -> mirror allowlisted remote images
  -> write feed/sitemap/search index
```

If image mirroring rewrites HTML, it should happen after `layout` render and before HTML write.

## Layout contract

`layout` should not hardcode every asset path forever. Prefer:

```ts
type AssetRefs = {
  styles: string[];
  scripts: Array<{
    src: string;
    defer?: boolean;
    type?: "module" | "text/javascript";
  }>;
};
```

Then:

```ts
layout({
  title,
  body,
  assets: {
    styles: [
      "/uno.css",
      "/assets/variables.css",
      "/assets/global.css",
      "/assets/home.css",
    ],
    scripts: [
      { src: "/assets/client-abc123.js", defer: true, type: "module" },
    ],
  },
});
```

This lets authored pages or article pages request page-specific CSS without hardcoding everything in global layout.

## Page-level assets

Authored pages and article pages can declare assets:

```ts
type PageAssets = {
  styles?: string[];
  scripts?: string[];
};
```

Example:

```ts
const homeRoute = {
  kind: "authored-page",
  id: "home",
  route: "/",
  outputPath: "index.html",
  assets: {
    styles: ["/assets/home.css"],
  },
  render: () => renderHomePage(),
};
```

The SSG merges:

- base assets
- route-level assets
- generated Vite assets

## Recommended first implementation

Keep it simple:

- Copy `public/` to `dist/`.
- Continue generating `public/uno.css`.
- Keep existing CSS files in `public/assets/`.
- Keep HTMX/Alpine CDN scripts for now, unless reproducible builds are required immediately.
- Add an `AssetRefs` parameter to `layout`.
- Let routes declare page-specific CSS.

Only introduce Vite client bundling when we actually add local client code that needs bundling.

## Avoid

- Do not make Hono SSG routes parse and bundle JavaScript.
- Do not mix generated build artifacts into source-controlled authored files.
- Do not put large mirrored images into Git.
- Do not make every CSS file global if a page-specific stylesheet is enough.
