# Cloudflare SSR bypass for Storefront GraphQL

Cloudflare on `api-new-uat.sopet.org` (and production API host) can return **Error 1010** (`browser_signature_banned`) for Node/`fetch` used by Next.js Server Components. Browser traffic is fine because the storefront `/graphql` rewrite forwards a real browser User-Agent.

## Storefront (code)

When `GRAPHQL_SSR_BYPASS_SECRET` is set, the RSC Apollo client sends:

```http
x-sopet-ssr-bypass: <GRAPHQL_SSR_BYPASS_SECRET>
```

See `src/lib/config.ts` and `src/lib/graphql/apollo-rsc.ts`. Localhost does not need this secret.

## Cloudflare WAF rule (UAT, then production)

On the API zone (e.g. `api-new-uat.sopet.org`):

1. **Security → WAF → Custom rules** (or Bot Fight / Super Bot Fight skip configuration).
2. Create a rule:
   - **Name:** `Allow Sopet storefront SSR GraphQL`
   - **Expression** (adjust field names to your Cloudflare UI / Ruleset engine):

     ```text
     (http.request.uri.path eq "/graphql" and http.request.headers["x-sopet-ssr-bypass"][0] eq "<SAME_SECRET_AS_VERCEL>")
     ```

   - **Action:** **Skip** — include Bot Fight Mode, Super Bot Fight Mode, Browser Integrity Check / managed challenge features that emit 1010. If Skip is unavailable, use **Allow** for this expression with higher priority than the block rule.
3. Deploy the rule.

### Verify with curl

Use a Node-like User-Agent (matches Next SSR). Or run `yarn`-free:

```bash
./scripts/verify-ssr-bypass.sh
GRAPHQL_SSR_BYPASS_SECRET='<secret>' ./scripts/verify-ssr-bypass.sh
```

Without secret (expect 1010 / 403 for empty / non-browser UA):

```bash
curl -sS -o /tmp/cf-deny.json -w "%{http_code}\n" \
  -A "" \
  -H "Content-Type: application/json" \
  -X POST "https://api-new-uat.sopet.org/graphql" \
  --data '{"query":"{ approvedCategories { id } }"}'
# Expect 403 and error 1010 / browser_signature_banned
```

With secret (expect 200 GraphQL JSON once the WAF skip rule is live):

```bash
curl -sS -o /tmp/cf-allow.json -w "%{http_code}\n" \
  -A "" \
  -H "Content-Type: application/json" \
  -H "x-sopet-ssr-bypass: <SAME_SECRET_AS_VERCEL>" \
  -X POST "https://api-new-uat.sopet.org/graphql" \
  --data '{"query":"{ approvedCategories { id } }"}'
# Expect 200 and {"data":{"approvedCategories":[...]}}
```

Or: `yarn verify:ssr-bypass` / `GRAPHQL_SSR_BYPASS_SECRET=... yarn verify:ssr-bypass`.

Repeat for the production API hostname after UAT is confirmed.

## Vercel env

| Variable                    | Example / notes                              |
| --------------------------- | -------------------------------------------- |
| `GRAPHQL_SSR_URL`           | `https://api-new-uat.sopet.org/graphql`      |
| `GRAPHQL_SSR_BYPASS_SECRET` | Strong random secret; **must match** CF rule |
| `NEXT_PUBLIC_GRAPHQL_URL`   | `/graphql`                                   |

Set under the UAT (then production) Vercel project → Settings → Environment Variables, then redeploy (or push `deploy/uat` / deploy hook).

Never set `NEXT_PUBLIC_GRAPHQL_SSR_BYPASS_SECRET` — the secret must stay server-only.

## Defense in depth

Catalog SSR pages use `runSsrPreloadQueries` and do **not** wrap trees in Apollo `PreloadQuery`. If CF/API is misconfigured, pages soft-degrade instead of a production Server Components digest crash.
