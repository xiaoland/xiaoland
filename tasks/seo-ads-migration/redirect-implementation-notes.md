# Redirect Implementation Notes

These notes are not applied yet.

## Current Old Vhost

Old vhost file:

```txt
/home/wwwroot/lnmp1/vhost/lanblog.conf
```

Important observed directives:

```nginx
server_name blog.hadream.ltd blog.hadream.local;
root /home/wwwroot/lnmp1/domain/lanblog/web$subdomain;
```

Current Typecho fallback:

```nginx
if (!-f $request_filename){
    rewrite (.*) /index.php;
}
```

## Recommended Redirect Shape

For the 81 article redirects, use exact-match `location =` blocks before PHP fallback:

```nginx
location = /index.php/archives/451/ {
    return 301 https://lanzhijiang.dev/article/key-based-ssh-auth;
}
```

For optional slashless variants:

```nginx
location = /index.php/archives/451 {
    return 301 https://lanzhijiang.dev/article/key-based-ssh-auth;
}
```

This is verbose, but it is deterministic and easy to validate against `old-url-map.csv`.

## Avoid

- Do not blanket redirect all old paths to `/`.
- Do not rewrite old article URLs to new URLs with JavaScript.
- Do not return 200 with canonical-only for old article URLs.
- Do not remove old domain hosting immediately after deployment.

