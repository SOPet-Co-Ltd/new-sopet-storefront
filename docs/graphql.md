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

## Clients

| Client  | File                            | Use                                                |
| ------- | ------------------------------- | -------------------------------------------------- |
| Browser | `src/lib/graphql/client.ts`     | `makeApolloClient()` — auth link, WS subscriptions |
| RSC     | `src/lib/graphql/apollo-rsc.ts` | `getClient()`, `PreloadQuery` — no auth link       |

### Browser client setup

```typescript
// client.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { authLink } from './authLink';

// HTTP for queries/mutations, WS for subscriptions
```

Subscriptions use `getGraphqlWsUrl()` for WebSocket endpoint (payment status).

## Operations

27 `.graphql` files in `src/lib/graphql/operations/` (plus shared fragments in `operations/fragments/`):

`account`, `addresses`, `auth`, `cart`, `categories`, `checkout`, `favorites`, `health`, `latestPurchaseProducts`, `me`, `notifications`, `orderTracking`, `orders`, `payment`, `paymentMethods`, `platform`, `product`, `products`, `profile`, `promotions`, `recommendedProducts`, `reviews`, `search`, `shipping`, `stores`, `taxonomy`, `upload`.

### Example operation

```graphql
# src/lib/graphql/operations/cart.graphql
query Cart($sessionId: String) {
  cart(sessionId: $sessionId) {
    id
    items { ... }
  }
}
```

## Codegen

`codegen.ts`:

```typescript
schema: process.env.GRAPHQL_SCHEMA_PATH ?? '../sopet-backend/src/schema.gql',
documents: ['src/lib/graphql/operations/**/*.graphql'],
generates: { 'src/lib/graphql/generated/graphql.ts': { ... } },
```

```bash
yarn graphql:codegen     # Manual
yarn build               # Runs codegen via prebuild hook
```

Post-process: `scripts/fix-graphql-codegen-duplicates.mjs`

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

- Attaches `Authorization: Bearer` from sessionStorage
- Handles token refresh on 401

## Related docs

- [Hooks](hooks.md)
- [Feature development](feature-development.md)
- [Backend API](../../new-sopet/sopet-backend/docs/api.md)
