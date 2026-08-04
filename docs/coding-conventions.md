# Coding Conventions

## TypeScript

- `strict: true` in `tsconfig.json`
- Path alias: `@/*` → `src/*`

## Naming

| Artifact    | Convention                                     |
| ----------- | ---------------------------------------------- |
| Components  | PascalCase (`ProductCard.tsx`)                 |
| Hooks       | camelCase with `use` prefix (`useProducts.ts`) |
| Utilities   | camelCase (`formatThaiDatetime.ts`)            |
| GraphQL ops | camelCase in `.graphql` files                  |
| Tests       | `*.test.tsx` or `*.test.ts` co-located         |

## Imports

```typescript
// Preferred order
import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Button } from '@/components/atoms/Button';
import { useProducts } from '@/lib/hooks/useProducts';
import { cn } from '@/lib/utils';
```

## ESLint

`eslint.config.mjs` — `eslint-config-next` core-web-vitals + typescript.

```bash
yarn lint
```

## Testing

| Tool   | Config                                 |
| ------ | -------------------------------------- |
| Vitest | `vitest.config.ts` — jsdom, `@` alias  |
| RTL    | `@testing-library/react`               |
| MSW    | `src/test/setup.ts` — server lifecycle |

```bash
yarn test
yarn test:watch
```

**Patterns:**

- Mock hooks at boundaries: `vi.mock('@/lib/hooks/useAuth')`
- MSW for GraphQL: override `server.use()` per test; shared fixtures in `src/test/mocks/fixtures/`
- Apollo wrapper: `createApolloTestWrapper()` from `src/test/createApolloTestWrapper.tsx` (preferred for MSW-backed hook/UI tests)
- Unit/component: `*.test.tsx` / `*.test.ts` co-located with source
- Integration: `*.int.test.tsx` / `*.int.test.ts` for multi-module flows
- Fixture E2E (RTL+MSW journeys): `*.fixture.e2e.test.tsx` — multi-step user flows from design acceptance criteria

## CI

`.github/workflows/ci.yml` (PRs to `main` / `uat`):

1. Sparse-checkout backend `schema.gql` into `sopet-backend/`
2. Node.js **22**, `yarn install --frozen-lockfile`
3. `yarn lint` → `yarn test` → `yarn build` (with `GRAPHQL_SCHEMA_PATH=sopet-backend/src/schema.gql`)
4. `scripts/check-forbidden-imports.sh`

Deploy: `.github/workflows/deploy.yml` posts to `VERCEL_DEPLOY_HOOK_URL` on `deploy/production` and `deploy/uat`.

## Package manager

Yarn only (`preinstall: npx only-allow yarn`, `packageManager: yarn@1.22.22`). Node.js 22+ (CI uses 22; `@types/node` may still be `^20`).

## Related docs

- [Feature development](feature-development.md)
- [Development guide](development-guide.md)
