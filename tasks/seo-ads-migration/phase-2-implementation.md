# Phase 2 Implementation

Date: 2026-05-28

Implemented on the target site only.

## Completed

- Added `public/ads.txt`.
- Added `public/google0082311ca71e0e82.html`.
- Added `public/robots.txt`.
- Added `description` and `canonicalUrl` support to `src/templates/layout.ts`.
- Added canonical URLs and meta descriptions for:
  - `/`
  - `/about`
  - `/article/:slug`

## Intentionally Not Added

- AdSense runtime script.

Reason: `ads.txt` is enough for the minimum authorization surface. Runtime ads should be added after `lanzhijiang.dev` is added to AdSense and the desired placement is confirmed.

## Verification

Commands run:

```bash
pnpm run typecheck
pnpm run build:ssg
pnpm run verify:dist
```

Checked generated files:

- `dist/ads.txt`
- `dist/google0082311ca71e0e82.html`
- `dist/robots.txt`
- `dist/index.html`
- `dist/article/key-based-ssh-auth.html`

