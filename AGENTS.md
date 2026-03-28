# Xiaoland's personal website

Tech Stacks:

- Cloudflare Worker: infrastructure & runtime.
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
│   └── pages/              # standalone pages
│       └── about.md
│
├── public/                 
│   ├── assets/             # font, media and other static assets
│   ├── images              
│       └── articles/       # article image
│   └── scripts/            # JS Scripts (alpine.js, ...)
│
├── src/                    
│   ├── index.ts            # application entry
│   │
│   ├── templates/          # view template
│   │   ├── layout.ts       # global HTML skeleton (HTMX injected here)
│   │   ├── home.ts         # home view HTML template
│   │   └── article.ts      # article page template
│   │
│   └── utils/              # business logic
│       └── markdown.ts     # Markdown parser
│
├── .gitignore
├── package.json
├── tsconfig.json
└── wrangler.toml           
```

## Development Workflow

- Tooling: pnpm, Wrangler CLI, Zed tasks & debugger

## Coding Guidelines

- Do not touch `README.md`.
