#!/usr/bin/env bash
set -euo pipefail

conf="/home/wwwroot/lnmp1/vhost/lanblog.conf"
snippet="/tmp/xiaoland-nginx-rewrite-redirects.conf"
backup="${conf}.bak.$(date +%Y%m%d%H%M%S)"

if [[ ! -f "$conf" ]]; then
  echo "Missing vhost config: $conf" >&2
  exit 1
fi

if [[ ! -f "$snippet" ]]; then
  echo "Missing redirect snippet: $snippet" >&2
  exit 1
fi

cp "$conf" "$backup"

python3 - "$conf" "$snippet" <<'PY'
from pathlib import Path
import sys

conf_path = Path(sys.argv[1])
snippet_path = Path(sys.argv[2])
conf = conf_path.read_text()
snippet = snippet_path.read_text().strip() + "\n"

begin = "# BEGIN xiaoland seo migration redirects"
end = "# END xiaoland seo migration redirects"

if begin in conf:
    start = conf.index(begin)
    finish = conf.index(end, start) + len(end)
    while finish < len(conf) and conf[finish] in "\r\n":
        finish += 1
    conf = conf[:start] + conf[finish:]

anchor = "    if (-f $request_filename/index.html){"
if anchor not in conf:
    raise SystemExit(f"Anchor not found: {anchor}")

conf = conf.replace(anchor, snippet + "\n\n" + anchor, 1)
conf_path.write_text(conf)
PY

echo "backup=$backup"
