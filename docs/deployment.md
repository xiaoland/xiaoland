# Deployment

## Cloudflare targets

- Pages project: `xiaoland`
- Pages production branch: `main`
- Production domain: `lanzhijiang.dev`
- Production Worker: `lanzhijiang`
- Production Worker route: `lanzhijiang.dev/api/*`
- Preview Worker naming: `lanzhijiang-pr-<number>`

Production deploys publish the Worker first, then Pages. Preview deploys create a per-PR Worker first, export `VITE_API_ORIGIN`, then build and upload the Pages preview.

## GitHub configuration

Required repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Optional repository variable:

- `CLOUDFLARE_WORKERS_SUBDOMAIN`; defaults to `lanzhijiang`

## Node.js runtime

The project runtime is pinned to Node.js 22 with `.nvmrc`.

Local setup:

```sh
nvm install
nvm use
pnpm install
```

GitHub Actions uses `actions/setup-node` with `node-version-file: .nvmrc`, so CI should run the same Node.js major version as local development. Workflow actions are pinned to current major versions instead of `@v4` to avoid the deprecated Node.js 20 action runtime.

## Cloudflare API token

Create a custom Cloudflare API token from the user profile API token page. Do not scope Worker script permissions only to a domain: `Workers Scripts` is an account-level permission, while `Workers Routes` is a zone-level permission.

Account resources:

- Select the Cloudflare account that owns the Pages project, Workers, and D1 database.

Account permissions:

- `Account Settings: Read`
- `Workers Scripts: Read`
- `Workers Scripts: Write`
- `Cloudflare Pages: Read`
- `Cloudflare Pages: Write`
- `D1: Read`
- `D1: Write`

Zone resources:

- Select `lanzhijiang.dev`.

Zone permissions:

- `Zone: Read`
- `Workers Routes: Read`
- `Workers Routes: Write`

`Workers Scripts` must be under Account resources because Wrangler deploy calls account-scoped Workers APIs such as `/accounts/<account_id>/workers/services/<name>`. `Workers Routes` belongs under Zone resources because the production route is attached to `lanzhijiang.dev`.

## DNS

The apex domain should point to Pages:

```txt
Type: CNAME
Name: @
Target: xiaoland.pages.dev
Proxy status: Proxied
```

The Worker route handles only API traffic:

```txt
lanzhijiang.dev/api/*
```

## CORS

Origin should be explictly set in Bindings.APP_ORIGIN,
default to `https://lanzhijiang.dev` and can be `xiaoland.pages.dev`
in preview environment.
