# Phase 3 Implementation

Date: 2026-05-28

Implemented on the old Typecho origin vhost.

## Scope Applied

- 81 old article URLs redirect to matching `https://lanzhijiang.dev/article/<slug>` URLs.
- Both article entry shapes are covered: `/index.php/archives/<id>/` and `/archives/<id>/`.
- Old home entry shapes `/` and `/index.php` redirect to `https://lanzhijiang.dev/`.
- Both about entry shapes `/index.php/about-page.html` and `/about-page.html` redirect to `https://lanzhijiang.dev/about`.
- Both feed entry shapes `/index.php/feed/` and `/feed/` redirect to `https://lanzhijiang.dev/rss.xml`.
- `sub_blog.html` and other non-home/about pages were intentionally left unchanged.

## Remote Files

- Vhost edited: `/home/wwwroot/lnmp1/vhost/lanblog.conf`
- Backup created: `/home/wwwroot/lnmp1/vhost/lanblog.conf.bak.20260528124202`
- Backup created for pathinfo/home fix: `/home/wwwroot/lnmp1/vhost/lanblog.conf.bak.20260528142304`
- Uploaded snippet: `/tmp/xiaoland-nginx-rewrite-redirects.conf`
- Uploaded verification input: `/tmp/xiaoland-origin-redirects.tsv`

## Generated Local Artifacts

- `tasks/seo-ads-migration/nginx-rewrite-redirects.conf`
- `tasks/seo-ads-migration/scripts/generate-nginx-rewrites.mjs`
- `tasks/seo-ads-migration/scripts/apply-remote-nginx-rewrites.sh`
- `tasks/seo-ads-migration/scripts/verify-public-redirects.mjs`
- `tasks/seo-ads-migration/public-redirect-verification.md`

## Commands Run

```bash
node tasks/seo-ads-migration/scripts/generate-nginx-rewrites.mjs
scp tasks/seo-ads-migration/nginx-rewrite-redirects.conf websp.hadream.local:/tmp/xiaoland-nginx-rewrite-redirects.conf
scp tasks/seo-ads-migration/scripts/apply-remote-nginx-rewrites.sh websp.hadream.local:/tmp/apply-xiaoland-nginx-rewrites.sh
sudo bash /tmp/apply-xiaoland-nginx-rewrites.sh
sudo /usr/local/nginx-1.18/sbin/nginx -t
sudo /usr/local/nginx-1.18/sbin/nginx -s reload
```

## Verification Passed

Origin vhost verification through `127.0.0.1:81`:

```txt
origin_redirects_total=83 failed=0
```

Target URL verification:

```txt
target_urls_total=83 failed=0
```

Additional spot checks:

- `http://127.0.0.1:81/index.php/sub_blog.html` with `Host: blog.hadream.ltd` returns `200 OK`.

## Public HTTPS Reverification

After the public HTTPS entry was repaired outside this origin vhost, public redirect verification was rerun:

```txt
total=169 failed=0
```

Coverage:

- `canonical-old-article`: 81/81 passed.
- `pathinfo-old-article`: 81/81 passed.
- `home`: 2/2 passed.
- `special`: 4/4 passed.
- `excluded`: 1/1 passed.

The first public verification found 81 failures for `/archives/<id>/` because Typecho redirected those URLs back to `https://blog.hadream.ltd/index.php/archives/<id>/`, creating a two-hop old-host chain. The managed block now directly handles those pathinfo article URLs, plus home/about/feed pathinfo variants.
