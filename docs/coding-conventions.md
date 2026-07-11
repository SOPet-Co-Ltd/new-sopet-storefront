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
- Apollo wrapper: `createApolloTestWrapper()` from `src/test/createApolloTestWrapper.tsx`
- Unit/component: `*.test.tsx` co-located with source
- Integration: `*.int.test.tsx` for multi-module flows (SSR props, hook wiring)
- Fixture E2E (RTL+MSW journeys): `*.fixture.e2e.test.tsx` — multi-step user flows from design-doc ACs; colocated with the feature under test or under `src/app/(main)/…` for route-level journeys
- Skeleton workflow: `*.fixture.e2e.skeleton.tsx` / `*.int.skeleton.tsx` document AC proof obligations; implement the paired `*.fixture.e2e.test.tsx` or `*.int.test.tsx` target named in the skeleton header, then remove the skeleton

## CI

`.github/workflows/ci.yml`:

1. Sparse-checkout backend `schema.gql`
2. `yarn lint` → `yarn test` → `yarn build`
3. `scripts/check-forbidden-imports.sh`

## Package manager

Yarn only (`preinstall: npx only-allow yarn`).

## Related docs

- [Feature development](feature-development.md)
- [Development guide](development-guide.md)
