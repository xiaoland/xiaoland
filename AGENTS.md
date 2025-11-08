# lanzhijiang

A Cloudflare Workers blog application built with Hono and MDX.

## Quick Start

```bash
pnpm install
pnpm run dev     # Development server
pnpm run build   # Production build
pnpm run deploy  # Deploy to Cloudflare Workers
```

## Features

- **MDX Articles**: Write articles in MDX with frontmatter support
- **Image Assets**: Automatic image processing and optimization
- **Comments System**: D1 database-powered comments
- **SSR**: Server-side rendering with client hydration
- **UnoCSS**: Instant on-demand utility-first CSS framework

## Documentation

- [Article Implementation](./docs/article.md) - Architecture and implementation details
- [Image Asset Fix](./docs/mdx-image-fix.md) - Solution for image 404 issues in production

## Development

### UnoCSS

This project uses UnoCSS for utility-first CSS. You can use any UnoCSS utility classes in your components.

- **Inspector**: Visit `http://localhost:5173/__unocss/` during development to inspect generated CSS
- **Configuration**: Customize in `uno.config.ts`
- **Usage**: Add utility classes directly in JSX: `<div class="bg-blue-500 text-white p-4">`

### Type Generation

For generating/synchronizing types based on your Worker configuration:

```bash
pnpm run cf-typegen
```

### Configuration

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Project Structure

```text
src/
├── index.tsx           # Main Hono app
├── article.tsx         # Article routes
├── renderer.tsx        # JSX renderer
└── db/                 # Database schema and queries
articles/
└── {slug}/
    ├── {slug}.mdx      # Article content
    └── [assets]/       # Article images
docs/                   # Documentation
scripts/                # Build scripts
```
