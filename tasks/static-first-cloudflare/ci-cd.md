# CI/CD

## Principle

Workflow files should orchestrate, not implement.

Do not put long shell scripts in `.github/workflows/*.yml`. Keep workflow steps small:

- checkout
- setup Node / pnpm
- install dependencies
- run repo scripts
- upload artifacts
- deploy with one repo script

All meaningful logic should live in `package.json` scripts or small TypeScript scripts under `scripts/`, so it can be run locally.

## Recommended repo scripts

Target scripts after the migration:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:worker": "wrangler dev --config wrangler.worker.toml --port 8787",
    "build": "pnpm run build:ssg && pnpm run build:worker",
    "build:ssg": "unocss \"src/**/*.ts\" -o \"./public/uno.css\" -c uno.config.ts && vite build --mode ssg",
    "build:worker": "wrangler deploy --dry-run --outdir .worker-build --config wrangler.worker.toml",
    "deploy:worker:preview": "tsx scripts/deploy-preview-worker.ts",
    "preview:static": "vite preview --mode ssg --host 127.0.0.1",
    "check": "pnpm run typecheck && pnpm run build:ssg && pnpm run verify:dist && pnpm run build:worker",
    "typecheck": "tsc --noEmit",
    "verify:dist": "tsx src/ssg/verify-dist.ts",
    "deploy:pages": "wrangler pages deploy dist --project-name xiaoland",
    "deploy:worker": "wrangler deploy --config wrangler.worker.toml"
  }
}
```

The exact test runner can be adjusted to the repo. The important part is that workflows call these scripts rather than embedding their contents.

The repo tracks `pnpm-lock.yaml`, so workflows should use `pnpm install --frozen-lockfile`.

## Workflow layout

### CI

File:

```txt
.github/workflows/ci.yml
```

Triggers:

- pull request
- push to main

Responsibilities:

- install dependencies
- run `pnpm run typecheck`
- run `pnpm run build:ssg`
- run `pnpm run build:worker`
- run `pnpm run verify:dist`
- upload `dist/` as an artifact

No deployment from this workflow.

### Preview deploy

File:

```txt
.github/workflows/deploy-preview.yml
```

Triggers:

- pull request

Responsibilities:

- run the same build path as CI
- deploy a per-PR preview Worker
- export `VITE_API_ORIGIN` for the SSG build
- deploy `dist/` to Cloudflare Pages preview with branch metadata

Preview model:

- Worker name: `lanzhijiang-pr-<number>`
- Worker URL: `https://lanzhijiang-pr-<number>.<workers-subdomain>.workers.dev`
- SSG receives `VITE_API_ORIGIN` before `pnpm run build:ssg`
- article HTMX fragments use `${VITE_API_ORIGIN}/api/...` in preview
- production leaves `VITE_API_ORIGIN` empty and uses same-origin `/api/...`

Reason:

- `*.pages.dev` is not a zone we can attach Worker routes to
- PR review needs per-PR API isolation instead of a single shared staging hostname
- cross-origin preview API is acceptable for read-only HTML fragments when CORS is explicit

### Production deploy

File:

```txt
.github/workflows/deploy-production.yml
```

Triggers:

- push to main
- optional manual `workflow_dispatch`

Responsibilities:

- run `pnpm run check`
- deploy Worker
- deploy Pages
- run smoke checks

Deploy Worker before Pages if the new static output depends on new API fragments. This avoids publishing static pages that call endpoints not yet deployed.

## Workflow shape

Workflow YAML should stay thin. Example shape:

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v6
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run check
```

Deploy workflows should be similarly thin:

```yaml
- run: pnpm run build:ssg
- run: pnpm exec wrangler pages deploy dist --project-name xiaoland --branch "${{ github.ref_name }}"
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

No heredocs, no inline Node scripts, no multi-screen shell blocks.

## Cloudflare deployment model

Use Wrangler direct upload from CI for Pages:

```txt
wrangler pages deploy dist --project-name xiaoland --branch <branch>
```

Use Wrangler deploy for Worker:

```txt
wrangler deploy --config wrangler.worker.toml
```

This keeps build logs, artifacts and deployment control inside GitHub Actions. Cloudflare Pages Git integration is also viable, but direct upload gives more explicit control and keeps the build path identical between CI and local scripts.

## Required secrets

GitHub environments:

- `preview`
- `production`

Secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Optional GitHub environment variable:

- `CLOUDFLARE_WORKERS_SUBDOMAIN`; defaults to `lanzhijiang` when unset

Create the token from the user profile API token page. Scope account-level permissions to the Cloudflare account and zone-level permissions to `lanzhijiang.dev`.

Account permissions:

- `Account Settings: Read`
- `Workers Scripts: Read`
- `Workers Scripts: Write`
- `Cloudflare Pages: Read`
- `Cloudflare Pages: Write`
- `D1: Read`
- `D1: Write`

Zone permissions:

- `Zone: Read`
- `Workers Routes: Read`
- `Workers Routes: Write`

`Workers Scripts` is account-scoped because Wrangler deploy calls account APIs such as `/accounts/<account_id>/workers/services/<name>`. `Workers Routes` is zone-scoped because route management happens under `lanzhijiang.dev`.

Production environment can require manual approval if desired.

Current Cloudflare setup:

- Cloudflare Pages project: `xiaoland`
- Pages production branch: `main`
- Static domain: `xiaoland.pages.dev`
- Production custom domain: `lanzhijiang.dev`
- Worker script: `lanzhijiang`
- Worker route: `lanzhijiang.dev/api/*`

The custom domain requires a proxied DNS record:

```txt
Type: CNAME
Name: @
Target: xiaoland.pages.dev
Proxy status: Proxied
```

Wrangler OAuth does not necessarily grant DNS record write permissions. If the token cannot create this record, add it from the Cloudflare Dashboard or use a Cloudflare API token with DNS edit permission.

## Verification scripts

`src/ssg/verify-dist.ts` should check:

- `dist/index.html` exists
- authored pages exist, such as `dist/about.html`
- sampled article pages exist
- `rss.xml`, `sitemap.xml`, `search-index.json` exist
- no public HTML references missing local assets
- allowlisted mirrored image URLs were rewritten
- non-allowlisted image URLs remain unchanged
- no generated HTML points to Worker for article body

Smoke checks after deploy can be a small script:

```txt
scripts/smoke-production.ts
```

It should check:

- home page returns 200
- one article page returns 200
- one static image returns 200
- `/api/health` or equivalent returns 200
- public article page response does not come from Worker-only route

## Image cache policy

Do not introduce persistent image cache in CI for the first implementation.

Use only build lifetime cache inside the image mirroring step. This keeps CI deterministic and avoids hidden deployment state.

If image downloads become a bottleneck, revisit persistent cache as a separate implementation slice.

## D1 migrations

Do not hide database migrations inside deploy scripts initially.

Recommended first step:

- CI checks migration files and generated schema consistency.
- Production D1 migrations remain manual or a separate explicitly triggered workflow.

Later:

- add `deploy:migrations`
- require production environment approval
- run migrations before Worker deploy

## Rollback

Pages rollback should use Cloudflare Pages deployment rollback.

Worker rollback should use Wrangler/Cloudflare Worker version rollback or redeploy a known-good commit.

Keep Pages and Worker deploys as separate steps so a failed Worker deploy does not publish static pages that depend on unavailable dynamic endpoints.

## Open decisions

- Whether preview deploy should include a preview Worker route.
- Whether production deploy should require manual approval.
- Whether D1 migrations should be automated later.
- Whether to use Cloudflare Pages Git integration instead of Wrangler direct upload.
