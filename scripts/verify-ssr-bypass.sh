#!/usr/bin/env bash
# Verify Cloudflare SSR bypass for Storefront GraphQL.
# Usage:
#   ./scripts/verify-ssr-bypass.sh
#   GRAPHQL_SSR_BYPASS_SECRET=... ./scripts/verify-ssr-bypass.sh
#   GRAPHQL_SSR_URL=https://api.example.org/graphql ./scripts/verify-ssr-bypass.sh
set -euo pipefail

URL="${GRAPHQL_SSR_URL:-https://api-new-uat.sopet.org/graphql}"
SECRET="${GRAPHQL_SSR_BYPASS_SECRET:-}"
QUERY='{"query":"{ approvedCategories { id } }"}'
# Mimic Next/Apollo SSR when Cloudflare bans non-browser signatures (Error 1010).
# Empty / omitted UA is commonly blocked; set NODE_UA=node to compare.
NODE_UA="${SSR_VERIFY_UA:-}"
CURL_UA_ARGS=()
if [ -n "$NODE_UA" ]; then
  CURL_UA_ARGS=(-A "$NODE_UA")
else
  CURL_UA_ARGS=(-A "")
fi

echo "== Target: $URL =="

deny_code=$(curl -sS -o /tmp/sopet-cf-deny.json -w "%{http_code}" \
  "${CURL_UA_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -X POST "$URL" \
  --data "$QUERY")
echo "SSR-like UA ('${NODE_UA:-empty}'), no bypass header: HTTP $deny_code"
if command -v python3 >/dev/null 2>&1; then
  python3 -c "import json;d=json.load(open('/tmp/sopet-cf-deny.json')); print(' ', d.get('error_name') or ('data' if 'data' in d else d))"
fi

browser_code=$(curl -sS -o /tmp/sopet-cf-browser.json -w "%{http_code}" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -X POST "$URL" \
  --data "$QUERY")
echo "Browser User-Agent: HTTP $browser_code"

if [ -z "$SECRET" ]; then
  echo "Skip secret test: set GRAPHQL_SSR_BYPASS_SECRET to verify CF allow path."
  if [ "$deny_code" = "403" ] || [ "$deny_code" = "401" ]; then
    echo "NOTE: Node-like UA is blocked (expected until CF rule + secret are live)."
  fi
  exit 0
fi

allow_code=$(curl -sS -o /tmp/sopet-cf-allow.json -w "%{http_code}" \
  "${CURL_UA_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -H "x-sopet-ssr-bypass: $SECRET" \
  -X POST "$URL" \
  --data "$QUERY")
echo "SSR-like UA ('${NODE_UA:-empty}') + x-sopet-ssr-bypass: HTTP $allow_code"
if command -v python3 >/dev/null 2>&1; then
  python3 -c "import json;d=json.load(open('/tmp/sopet-cf-allow.json')); print(' ', 'ok' if 'data' in d else d.get('error_name') or d)"
fi

if [ "$allow_code" != "200" ]; then
  echo "FAIL: expected HTTP 200 with bypass secret (is the Cloudflare WAF rule deployed?)"
  exit 1
fi
echo "PASS: bypass secret accepted by Cloudflare for Node-like SSR traffic."
