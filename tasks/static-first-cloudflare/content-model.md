# Content Model

## Naming problem

`content/` should not mean "everything rendered as a page".

There are at least four different concepts:

- content source: author-owned Markdown article data.
- authored page: route-level raw HTML page, such as Home, About, Me.
- content-backed page: route-level document generated from Markdown content, currently Article.
- template: raw HTML rendering function.
- dynamic fragment: runtime HTML/JSON island loaded by HTMX or client JS.

Keeping these separate prevents authored pages like Home/About/Me from being confused with article-like content.

## Proposed source layout

```txt
content/
  articles/
    <slug>.md          # article content source

src/
  pages/
    home.ts            # authored raw HTML page definition
    about.ts           # authored raw HTML page definition
    me.ts              # authored raw HTML page definition, if needed
    article.ts         # article page factory over Markdown content
    archive.ts         # optional

  site/
    content.ts         # load article content sources from content/articles/
    render.ts          # render full HTML documents
    page-types.ts      # shared page/content/fragment types

  templates/
    layout.ts
    home.ts
    article.ts
    about.ts
    sections/

  fragments/
    article-comments.ts
    reaction-bar.ts
    newsletter-box.ts

  worker/
    index.ts
```

## Page definitions

`src/pages/*` defines route-level pages. Home/About/Me are authored pages and should be raw HTML/TS renderers, not Markdown content sources.

Example:

```ts
export const homePageDefinition = {
  kind: "authored-page",
  route: "/",
  outputPath: "index.html",
  title: "Xiaoland",
  getData: async (site) => ({
    articles: site.articles,
  }),
  render: ({ data }) => renderHomeDocument(data),
};
```

Home belongs in `src/pages/home.ts` because it is an application-level page composed from site data, not a Markdown content source.

About and Me also belong in `src/pages/about.ts` / `src/pages/me.ts`. They can still call reusable template helpers, but their source is code-owned raw HTML rather than `content/pages/*.md`.

## Content source types

```ts
type ArticleContent = {
  kind: "article";
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  html: string;
};
```

These types describe content source, not final page behavior. At the current target, article Markdown is the only content source type.

## Page route types

```ts
type AuthoredPageRoute = {
  kind: "authored-page";
  id: "home" | "about" | "me" | string;
  route: string;
  outputPath: string;
  title: string;
  render: () => Promise<string> | string;
  fragments?: DynamicFragmentMount[];
};

type ArticlePageRoute = {
  kind: "article-page";
  route: `/article/${string}`;
  outputPath: string;
  article: ArticleContent;
  render: () => Promise<string> | string;
  fragments?: DynamicFragmentMount[];
};

type StaticRoute = AuthoredPageRoute | ArticlePageRoute;
```

This lets Home/About/Me and Article pages have different route-level behavior while still sharing the same static build pipeline.

## Dynamic fragment mounts

Dynamic content should be modeled as explicit mounts, not as page type leakage.

```ts
type DynamicFragmentMount = {
  id: string;
  endpoint: `/api/fragments/${string}`;
  trigger: "load" | "revealed" | "click";
  fallbackHtml?: string;
};
```

Example:

```ts
const aboutPage = {
  kind: "authored-page",
  id: "about",
  route: "/about",
  outputPath: "about.html",
  fragments: [
    {
      id: "latest-status",
      endpoint: "/api/fragments/latest-status",
      trigger: "revealed",
      fallbackHtml: "",
    },
  ],
};
```

The page remains static. The fragment is dynamic.

## Template ownership

Templates should stay focused on HTML shape:

- `src/templates/home.ts` renders Home content.
- `src/templates/about.ts` renders About document body.
- `src/templates/article.ts` renders Article document body.
- `src/templates/layout.ts` wraps body into a full document.
- `src/templates/sections/*` renders reusable static sections.

Fragments should not live in `templates/sections` if they require runtime data. Put runtime fragment renderers under `src/fragments/` or `src/worker/fragments/`.

## Recommended rule

- `content/articles/`: article Markdown sources only.
- `src/pages/`: route-level authored page definitions and article route factory.
- `src/templates/`: raw HTML template functions.
- `src/fragments/`: reusable dynamic fragment renderers.
- `src/worker/`: Hono API routes that serve fragments and writes.

This keeps Home/About/Me as authored raw HTML pages, Articles as content-backed pages, and HTMX fragments as runtime islands.
