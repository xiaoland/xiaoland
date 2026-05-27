# Hono and Dev Workflow

## Hono SSG support

Hono has an official SSG helper, `hono/ssg`, with `toSSG(app, fs)`.

It works by walking registered Hono routes, requesting their responses, and writing static files. Route naming is based on registered paths: `/` becomes `index.html`, `/path` becomes `path.html`, and `/path/` becomes `path/index.html`.

## Recommendation

Use Hono SSG for public pages, preferably through `@hono/vite-ssg`.

Reasons:

- It avoids inventing a custom route/page manifest that starts looking like a small framework.
- It lets Vite own the build graph, transforms and future client assets.
- It supports dynamic route generation through `ssgParams`.
- It keeps public page rendering in the same Hono mental model while still producing static files.
- Existing templates are already raw string functions, so Hono routes can return `c.html(layout(...))`.

Preferred shape:

- `src/ssg/app.ts` defines the build-time public Hono app.
- `src/worker/index.ts` defines the runtime API Hono app.
- Shared renderers live in `src/pages/*`, `src/templates/*`, and `src/site/*`.
- Vite uses `@hono/vite-ssg` to generate `dist/`.

## What "shared templates at build time" means

It means Hono SSG routes call the same pure rendering functions that templates already expose.

Example shape:

```ts
const body = articlePage({ article });
const html = layout({ title: article.title, body });
```

The SSG route returns `c.html(html)`, and `@hono/vite-ssg` writes the generated file.

## Static routes

Use Hono routes as the static route registry:

```ts
const app = new Hono();

app.get("/", (c) => c.html(renderHomeDocument(site)));

app.get(
  "/article/:slug",
  ssgParams(() => site.articles.map((article) => ({ slug: article.slug }))),
  (c) => {
    const article = site.getArticle(c.req.param("slug"));
    return article ? c.html(renderArticleDocument(article)) : c.notFound();
  },
);
```

For authored pages:

```ts
app.get("/about", (c) => c.html(renderAboutDocument()));
```

This gives enough structure without creating a parallel router.

## Non-page outputs

RSS, sitemap and search index can be handled as Hono SSG routes too:

```ts
app.get("/rss.xml", (c) => c.body(renderRss(site), 200, {
  "Content-Type": "application/xml",
}));
```

If an artifact does not fit Hono SSG cleanly, add a small post-build script. Do not turn that script into a second page generator.

## File structure impact

Suggested target:

```txt
src/
  site/
    content.ts          # load Markdown content
    frontmatter.ts      # parse frontmatter
    markdown.ts         # Markdown -> HTML
    render.ts           # render full documents
    image-mirroring.ts  # build-time remote image mirroring
    feed.ts             # RSS / feed generation
    sitemap.ts          # sitemap generation
    search.ts           # search-index generation

  templates/
    layout.ts
    home.ts
    article.ts
    sections/

  worker/
    index.ts            # Hono API only after split

  ssg/
    app.ts              # Hono SSG public app

scripts/
  postbuild-static.ts   # optional non-page artifacts / image rewrite hooks
  preview-static.ts     # optional static file server
```

Target:

```txt
src/index.ts            # no public-page SSR
src/worker/index.ts     # Hono API app
src/ssg/app.ts          # Hono SSG app for public pages
```

## Local dev modes

There should be two local modes:

### Static public-page dev

```txt
pnpm dev
```

Purpose:

- Serve public pages through the same SSG/static-generation path used by production.
- Watch content, templates and assets.
- Rebuild or regenerate affected static output.

### Production-like static preview

```txt
pnpm build:static
pnpm preview:static
```

Purpose:

- Preview the real Pages output.
- Verify `dist/` is self-contained.
- Verify image mirroring and static asset paths.
- Verify no-JS article reading.

After deployment split, static preview becomes the source of truth for public pages. `pnpm dev` should mainly cover Worker API and fragment development.
Worker API development can run in a separate command such as `pnpm dev:worker`.

## Expected dev experience changes

- Editing templates should still be straightforward, but public-page correctness must be checked through static preview.
- Editing Markdown may require rerunning `build:static`, unless we add a watch mode later.
- API / HTMX fragment development remains Hono-based.
- The site should not become a SPA; static HTML remains the first response.
