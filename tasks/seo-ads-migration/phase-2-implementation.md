# Phase 2 Implementation

Date: 2026-05-28

Implemented on the target site only.

## Completed

- Added `public/google0082311ca71e0e82.html`.
- Added `public/robots.txt`.
- Added `description` and `canonicalUrl` support to `src/templates/layout.ts`.
- Added canonical URLs and meta descriptions for:
  - `/`
  - `/about`
  - `/article/:slug`

## AdSense Migration Reverted

`public/ads.txt` was removed after deciding to set up AdSense fresh instead of migrating the old `ads.txt` authorization.

No AdSense runtime script is currently emitted by the new site. The `google-adsense-account` meta is retained for fresh AdSense site verification.

## Verification

Commands run:

```bash
pnpm run typecheck
pnpm run build:ssg
pnpm run verify:dist
```

Checked generated files:

- `dist/google0082311ca71e0e82.html`
- `dist/robots.txt`
- `dist/index.html`
- `dist/article/key-based-ssh-auth.html`
