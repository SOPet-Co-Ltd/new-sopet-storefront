#!/usr/bin/env bash
set -euo pipefail

URL="${GRAPHQL_SSR_URL:-https://api-new-uat.sopet.org/graphql}"
SECRET="${GRAPHQL_SSR_BYPASS_SECRET:-}"
QUERY='{"query":"{ __typename }"}'
CURL_UA_ARGS=(-A "")

echo "== Target: $URL =="

deny_code=$(curl -sS -o /tmp/sopet-cf-deny.json -w "%{http_code}" \
  "${CURL_UA_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -X POST "$URL" \
  --data "$QUERY")
echo "Empty UA, no bypass header: HTTP $deny_code"

if [ -z "$SECRET" ]; then
  echo "Skip secret test: set GRAPHQL_SSR_BYPASS_SECRET to verify CF allow path."
  exit 0
fi

allow_code=$(curl -sS -o /tmp/sopet-cf-allow.json -w "%{http_code}" \
  "${CURL_UA_ARGS[@]}" \
  -H "Content-Type: application/json" \
  -H "x-sopet-ssr-bypass: $SECRET" \
  -X POST "$URL" \
  --data "$QUERY")
echo "Empty UA + x-sopet-ssr-bypass: HTTP $allow_code"

if [ "$allow_code" != "200" ]; then
  echo "FAIL: expected HTTP 200 with bypass secret (is the Cloudflare WAF rule deployed?)"
  exit 1
fi
echo "PASS: bypass secret accepted by Cloudflare."
