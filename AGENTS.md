# Coding Agent Guide

This is a blog application of Lanzhijiang.

## Tech Stacks

- Cloudflare Worker, D1
- DrizzleORM
- Hono JSX
- Vite + ViteSSR (vite-ssr-components)
- UnoCSS

## Project Structure

```text
src/
├── index.tsx           # App entry
├── home.tsx            # Home page
├── ArticleList.tsx     # Home page article list component
├── article/            # Article page and article related components
└── db/                 # Database schema and queries
articles/
└── {slug}/
    ├── {slug}.{mdx,md} # Article content
    └── [assets]        # Article attachments
```
