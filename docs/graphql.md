# GraphQL (Storefront)

## URL resolution

`src/lib/config.ts`:

```typescript
export const GRAPHQL_URL =
  typeof window === 'undefined'
    ? (process.env.GRAPHQL_SSR_URL ?? 'http://localhost:3002/graphql')
    : (process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql');
```

Browser → `/graphql` (rewritten by `next.config.ts`).
SSR → direct backend URL.

WebSocket subscriptions use `getGraphqlWsUrl()` (defaults to `ws://localhost:3002/graphql`). Optional overrides: `NEXT_PUBLIC_GRAPHQL_WS_URL`, `NEXT_PUBLIC_GRAPHQL_BACKEND_ORIGIN`, `GRAPHQL_WS_SSR_URL`.

### Cloudflare SSR bypass (UAT/prod)

See [cloudflare-ssr-bypass.md](./cloudflare-ssr-bypass.md). RSC Apollo sends `x-sopet-ssr-bypass` when `GRAPHQL_SSR_BYPASS_SECRET` is set. Catalog pages soft-degrade without `PreloadQuery`; product pages never `notFound()` on transport failure.

## Clients

| Client  | File                            | Use                                                    |
| ------- | ------------------------------- | ------------------------------------------------------ |
| Browser | `src/lib/graphql/client.ts`     | `makeApolloClient()` — auth link, WS subscriptions     |
| RSC     | `src/lib/graphql/apollo-rsc.ts` | `getClient()` — SSR preload; optional CF bypass header |

Browser client wires `authLink`, HTTP, and a split link for GraphQL subscriptions (payment status updates). Cache uses `cachePolicies.ts` type policies plus `fragmentRegistry.ts`.

## Operations

27 `.graphql` files in `src/lib/graphql/operations/` (plus shared fragments in `operations/fragments/`):

`account`, `addresses`, `auth`, `cart`, `categories`, `checkout`, `favorites`, `health`, `latestPurchaseProducts`, `me`, `notifications`, `orderTracking`, `orders`, `payment`, `paymentMethods`, `platform`, `product`, `products`, `profile`, `promotions`, `recommendedProducts`, `reviews`, `search`, `shipping`, `stores`, `taxonomy`, `upload`.

Shared fragment example: `operations/fragments/ProductCardFields.graphql`.

## Codegen

`codegen.ts` resolves the schema path as:

1. `GRAPHQL_SCHEMA_PATH` if set
2. Else the first existing candidate: `../sopet-backend/src/schema.gql` or `sopet-backend/src/schema.gql`
3. Else defaults to `../sopet-backend/src/schema.gql`

Documents: `src/lib/graphql/operations/**/*.graphql`  
Output: `src/lib/graphql/generated/graphql.ts` (plugins: `typescript`, `typescript-operations`, `typed-document-node`)

```bash
yarn graphql:codegen     # Manual
yarn build               # Runs codegen via prebuild hook
yarn graphql:watch       # Watch mode (codegen only)
```

`yarn graphql:codegen` runs:

1. `scripts/ensure-graphql-schema.mjs` (local file, or GitHub fetch via `GRAPHQL_SCHEMA_GITHUB_*` when missing)
2. `graphql-codegen --config codegen.ts`
3. `scripts/fix-graphql-codegen-duplicates.mjs` on the generated file

### Usage in code

```typescript
import {
  CartDocument,
  type CartQuery,
  type CartQueryVariables,
} from '@/lib/graphql/generated/graphql';
import { useQuery } from '@apollo/client/react';

const { data, loading } = useQuery(CartDocument, { variables: { sessionId } });
```

## Variable builders

`src/lib/graphql/query-variables.ts` centralizes complex variable construction:

```typescript
import { buildProductsListingVariables } from '@/lib/graphql/query-variables';
```

Used by `useProducts`, SSR pages, and search.

## Auth link

`src/lib/graphql/authLink.ts`:

- Attaches `Authorization: Bearer` from `sessionStorage` (`sopet_access_token`)
- On 401 / `UNAUTHENTICATED`, refreshes with `RefreshTokenDocument`, retries once, then `notifyAuthFailure()`

## Related docs

- [Hooks](hooks.md)
- [Feature development](feature-development.md)
- [Backend API](../../sopet-backend/docs/api.md)
