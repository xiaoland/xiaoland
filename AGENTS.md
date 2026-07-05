# Xiaoland's personal website

Tech Stacks:

- Cloudflare Pages: where frontend hosted.
- Cloudflare Worker: where backend runs.
- Hono: backend, handling HTTP requests, routing, and server-side HTML generation using strict TypeScript.
- HTMX: frontend, drives dynamic page updates through HTML-over-the-wire.
- Alpine.js: manages purely client-side micro-interactions and transient UI states.

Features & Invariants:

- File-system driven content management: utilizing local Markdown files as the single source of truth without any standalone CMS.

## Repository Layout (Crucial Only)

```ascii
.
├── content/                # my website's content
│   ├── articles/           
│   │   └── <article-slug>.md
│
├── public/                 # Frontend root
│   ├── assets/             # font, media and other static assets
│   ├── articles/           # articles in HTML
│   ├── images              
│       └── articles/       # article image
│
├── src/                    
│   ├── worker              
│       └── index.ts        # Backend entry
│   ├── db/                 # DB Schemas
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.pages.ts
└── wrangler.pages.toml
```

## Development Workflow

- Tooling: pnpm, Wrangler CLI, Zed tasks & debugger
- Database migration: `pnpm run db:generate` + `pnpm run db:apply:local`

## Coding Guidelines

- Do not touch `README.md`.
