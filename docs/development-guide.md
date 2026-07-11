# Development Guide

Answers to common "where do I put this?" questions.

## Where should I add a new page?

1. **Route file:** `src/app/(main)/my-route/page.tsx` (or appropriate route group)
2. **UI:** `src/components/pages/MyPage.tsx` or `src/components/sections/MySection.tsx`
3. **Data:** `src/lib/hooks/useMyFeature.ts` + `src/lib/graphql/operations/my-feature.graphql`

Keep `page.tsx` thin — delegate to components.

## Where should I add a reusable component?

| Scope                     | Location                    |
| ------------------------- | --------------------------- |
| Primitive (button, input) | `src/components/atoms/`     |
| Small composition         | `src/components/molecules/` |
| Feature block             | `src/components/organisms/` |
| Full page section         | `src/components/sections/`  |
| Layout shell              | `src/components/templates/` |

Follow atomic design import rules.

## Where should I add business logic?

| Logic type                     | Location                             |
| ------------------------------ | ------------------------------------ |
| Checkout rules                 | `src/lib/checkout/`                  |
| Payment/Omise                  | `src/lib/payment/`                   |
| Search filters                 | `src/lib/search/`                    |
| Address formatting             | `src/lib/address/`                   |
| Domain rules requiring backend | **Backend service** — not storefront |

Storefront should not duplicate backend validation. Use backend error codes.

## How should I call APIs?

1. Add `.graphql` operation in `src/lib/graphql/operations/`
2. `yarn graphql:codegen`
3. Create hook in `src/lib/hooks/` using `*Document`
4. Use hook in component

For SSR pages, use `getClient()` from `apollo-rsc.ts` + `PreloadQuery`.

## How should I access the database?

**You cannot.** All data via GraphQL to the backend.

## How should I organize new features?

```text
src/app/(main)/feature/page.tsx          # route
src/components/sections/FeaturePage/     # UI
src/lib/hooks/useFeature.ts              # data
src/lib/graphql/operations/feature.graphql
```

## How should I name files?

- Components: PascalCase folder + file
- Hooks: `use` + PascalCase domain
- Utils: camelCase descriptive name

## How should I write tests?

| What      | Where                                        |
| --------- | -------------------------------------------- |
| Component | `ComponentName.test.tsx` next to component   |
| Hook      | `src/lib/hooks/__tests__/useFeature.test.ts` |
| Route     | `src/app/.../page.test.tsx`                  |
| Pure util | `feature.test.ts` next to util               |

Use MSW for GraphQL, mock providers at boundaries.

## Related docs

- [Feature development](feature-development.md)
- [Folder structure](folder-structure.md)
