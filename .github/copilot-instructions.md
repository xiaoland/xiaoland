# AI Coding Guidelines for lanzhijiang

## Architecture Overview

This is a Cloudflare Workers application using Hono framework for server-side rendering (SSR) of a blog/website. The app serves MDX articles with frontmatter metadata, deployed as an edge function.

**Key Components:**

- `src/index.tsx`: Main Hono app with route definitions
- `src/renderer.tsx`: JSX renderer using `vite-ssr-components` for hydration
- `articles/{slug}/{slug}.mdx`: Article content with frontmatter (title, etc.)
- Routes: `/` (homepage), `/article/{slug}` (individual articles)

## Development Workflow

```bash
pnpm run dev          # Start Vite dev server with hot reload
pnpm run build        # Production build with Vite
pnpm run deploy       # Build + deploy to Cloudflare Workers
pnpm run cf-typegen   # Generate CloudflareBindings types from wrangler config
```

## Code Patterns & Conventions

### Hono App Setup

Always instantiate Hono with Cloudflare bindings:

```typescript
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

### Article Structure

Articles follow this exact pattern in `articles/`:

```
articles/
  └── {slug}/
      ├── {slug}.mdx    # MDX content with frontmatter
      └── [assets]/     # Images and other files
```

Frontmatter format:

```mdx
---
title: Article Title Here
---

Article content in MDX...
```

### TypeScript Configuration

- Target: ESNext modules
- JSX: `react-jsx` with `jsxImportSource: "hono/jsx"`
- Strict mode enabled
- Includes `vite/client` types

### Build & Deployment

- Uses `@cloudflare/vite-plugin` for Workers integration
- `vite-ssr-components/plugin` for SSR support
- Wrangler handles deployment and type generation
- Main entry: `src/index.tsx` (export default app)

## Integration Points

- **Cloudflare Workers**: Environment bindings via `CloudflareBindings` interface
- **Vite SSR**: Client-side hydration with `<ViteClient />` component
- **MDX Processing**: Articles rendered server-side for SEO
- **Asset Handling**: Static files in `public/`, styles in `src/style.css`

## Common Patterns

- Routes defined directly on Hono app instance
- Renderer middleware applied via `app.use(renderer)`
- Article routing: `/article/{slug}` maps to `articles/{slug}/{slug}.mdx`
- CSS linked via `<Link>` component from `vite-ssr-components`

## Development Notes

- Run `npm run cf-typegen` after modifying `wrangler.jsonc` bindings
- Articles are SSR'd for SEO but hydrate on client for interactivity
- Use `vite-ssr-components` for client/server coordination</content>
  <parameter name="filePath">d:\CODING\Project\In-Progress\lanzhijiang\.github\copilot-instructions.md
