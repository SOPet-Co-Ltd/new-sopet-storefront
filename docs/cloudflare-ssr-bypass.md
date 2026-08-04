# Cloudflare SSR bypass for Storefront GraphQL

Cloudflare on `api-new-uat.sopet.org` can return **Error 1010** for Node/`fetch` used by Next SSR. Browser traffic works via `/graphql` rewrite (browser User-Agent).

## Storefront code

When `GRAPHQL_SSR_BYPASS_SECRET` is set, RSC Apollo sends:

```http
x-sopet-ssr-bypass: <GRAPHQL_SSR_BYPASS_SECRET>
```

Never use `NEXT_PUBLIC_*` for this value.

## Product pages (important)

Transport failures must **not** call `notFound()`. Only call `notFound()` when the API successfully responds with a missing or unpublished product. Otherwise CF outages become English 404s.

## Cloudflare WAF rule

Zone for `api-new-uat.sopet.org` → Security → WAF → Custom rules:

- **Name:** `Allow Sopet storefront SSR GraphQL`
- **Expression:**

```text
(http.request.uri.path eq "/graphql" and any(http.request.headers["x-sopet-ssr-bypass"][*] eq "<SAME_SECRET_AS_VERCEL>"))
```

- **Action:** Skip (Bot Fight / Super Bot Fight / Browser Integrity) or Allow
- Deploy

### Verify

```bash
# Expect 403 / 1010 (empty UA, no header)
curl -sS -o /dev/null -w "%{http_code}\n" -A "" \
  -H "Content-Type: application/json" \
  -X POST "https://api-new-uat.sopet.org/graphql" \
  --data '{"query":"{ __typename }"}'

# Expect 200 after CF rule is live
curl -sS -o /dev/null -w "%{http_code}\n" -A "" \
  -H "Content-Type: application/json" \
  -H "x-sopet-ssr-bypass: <SECRET>" \
  -X POST "https://api-new-uat.sopet.org/graphql" \
  --data '{"query":"{ __typename }"}'
```

Or: `yarn verify:ssr-bypass`

## Vercel env

| Variable                    | Value                                   |
| --------------------------- | --------------------------------------- |
| `GRAPHQL_SSR_URL`           | `https://api-new-uat.sopet.org/graphql` |
| `GRAPHQL_SSR_BYPASS_SECRET` | same secret as Cloudflare rule          |
| `NEXT_PUBLIC_GRAPHQL_URL`   | `/graphql`                              |

Redeploy after setting env.
