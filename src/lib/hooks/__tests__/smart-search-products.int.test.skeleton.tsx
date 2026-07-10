// Smart Search Products Wiring [integration] Test Skeleton - Design Doc: smart-search-frontend-design.md
// Backend Design Doc: smart-search-backend-design.md | UI Spec: smart-search-ui-spec.md
// Generated: 2026-07-10 | Budget Used (Smart Search feature): integration 3/3 (storefront slot; backend 2/3 in smart-search.int.test.ts)
//
// Implement target: src/lib/hooks/__tests__/smart-search-products.int.test.tsx
// Covers:
//   src/lib/hooks/useProducts.ts (extended sessionId, searchContext)
//   src/lib/graphql/query-variables.ts (`buildProductsListingVariables`)
//   src/lib/hooks/useSearchContext.ts, src/lib/hooks/useRecentSearches.ts
//   src/components/sections/ProductListing/ProductListing.tsx (variant="search", order preservation)
//   src/app/(main)/search/page.tsx (SSR reads `sopet_session_id` cookie per user decision)
//
// Harness: Vitest + RTL + MSW (existing `src/test/mocks/handlers.ts` pattern); real sessionStorage
// for recent searches; mock request cookies / `document.cookie` for sopet_session_id on SSR + client.
//
// Test Boundaries compliance (Frontend Design Doc):
// Mock: GraphQL transport (MSW)
// No mock: sessionStorage (recent searches behavior)
//
// User decisions incorporated:
//   - SSR passes sessionId via cookie on server and client (not client-only refetch)
//   - Recent searches P1 via sessionStorage → searchContext.recentQueries
//
// ---------------------------------------------------------------------------
// AC-035: "WHEN `/search?q=...` loads, THE SYSTEM SHALL pass `sessionId` and `searchContext`
// to the `products` query" AND "SHALL NOT reorder products client-side relative to server
// response order"
// AC-037: "WHEN SSR and client share identical variables, THE SYSTEM SHALL NOT flash a
// different product order on hydration"
// ROI: 92 (BV:9 × Freq:9 + Legal:0 + Defect:8) — highest-ROI storefront integration slot
// Behavior: search listing issues `Products` query with `search`, `sessionId` from
// `sopet_session_id` cookie on both SSR loader and client `useProducts`, and
// `searchContext.recentQueries` from sessionStorage; rendered product grid link order exactly
// matches GraphQL `items[].id` sequence on first paint and after hydration (no client sort,
// no reorder flash when variables match).
// @category: core-functionality
// @lane: integration
// @dependency: useProducts, ProductListing (variant="search"), search/page.tsx SSR path, MSW Products handler, session.ts cookie helpers, useSearchContext
// @complexity: high
// Primary failure mode: sessionId omitted on SSR (client-only wiring), searchContext not built
// from recent searches, ProductListing re-sorts after fetch, or hydration refetch reshuffles
// server Smart Search order.
// Proof obligation: seed sessionStorage `sopet_recent_searches` + cookie UUID; render search
// page tree with `initialProducts` in deliberate order ['id-3','id-1','id-2']; assert SSR
// and client MSW captured variables both include same sessionId from cookie and
// searchContext.recentQueries (max 10); assert DOM product link order matches mock order on
// first render and after hydration tick; optional guard that PreloadQuery prevents duplicate
// fetch when cache aligned.
// Verification points / expected results / pass criteria:
//   - GraphQL variables include sessionId from cookie on SSR and client paths.
//   - searchContext.recentQueries populated from sessionStorage when search active.
//   - Grid order equals API order before and after hydration (no flash/reorder).
//   - Fail if variables diverge between SSR/client, or client reorder detected.
