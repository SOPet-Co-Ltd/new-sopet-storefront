// Search Results SSR Reconciliation [fixture-e2e] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (S-04 / SearchResultsPage)
// Generated: 2026-07-09 | Budget Used: integration 3/3, fixture-e2e 3/3 (this file contributes 1, additional slot ROI>=20), service-e2e 0/2
//
// Implement target: src/app/(main)/search/search-page.fixture.e2e.test.tsx
// Covers: src/app/(main)/search/page.tsx -> SearchResultsPage -> ProductListing (variant="search", initialProducts)
// Existing component under extension: src/components/pages/SearchResultsPage.tsx (currently 'use client', reads `?q=` via useSearchParams)
//
// ---------------------------------------------------------------------------
// AC-005: "WHEN a cold request is made to `/search?q=...`, THE SYSTEM SHALL
// return initial HTML containing matching results for that query before
// client JS executes" (PRD SF-4; UI Spec S-04 "Cold request (SSR) with `?q=`")
// ROI: 63 (BV:8 x Freq:7 + Legal:0 + Defect:7)
// Behavior: a shopper opens or shares a `/search?q=...` URL; the server
// resolves the search query via RSC fetch and seeds `initialProducts` into
// `ProductListing`, so matching results are already visible on first paint
// -- this is the fixture-e2e "shared URL" journey UI-P1/UI-P2 guard against.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked GraphQL transport for ProductsDocument with search variable), search-page RSC entry, SearchResultsPage/ProductListing (variant="search")
// @complexity: medium
// Primary failure mode: the search route still hands off 100% to the
// client `SearchResultsPage` (reading `q` from `useSearchParams` and firing
// `useQuery` only after hydration), so a shopper who opens a shared search
// link sees `ProductListingSkeleton variant="search"` instead of matching
// results on the very first paint.
// Proof obligation: drive a full render of the search route/page tree for
// a URL containing `?q=<term>` with the GraphQL transport mocked to return
// a known fixture, and assert matching product results are present in the
// very first rendered output (before any client-triggered fetch resolves)
// and that `ProductListingSkeleton variant="search"` never mounts for that
// cold load. Also assert the existing "no results" empty state still
// renders correctly for a query fixture with zero matches (unchanged
// baseline per UI Spec).
// Verification points / expected results / pass criteria:
//   - First-paint render contains the mocked matching product(s) for the
//     `q` term, sourced from `initialProducts`, not a post-hydration
//     client fetch.
//   - `ProductListingSkeleton variant="search"` is absent on this cold
//     load.
//   - Existing "no results" empty-state UI (unchanged) still renders when
//     the fixture has zero matches for the query.
//   - Fail if the skeleton renders on cold load, if results are missing
//     until after a simulated hydration tick, or if the empty-state
//     regresses.
