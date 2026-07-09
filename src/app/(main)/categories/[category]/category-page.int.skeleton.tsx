// Category PLP SSR Reconciliation [integration] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (S-03 / CategoryPLP)
// Generated: 2026-07-09 | Budget Used: integration 3/3 (this file contributes 1), fixture-e2e 0/3, service-e2e 0/2
//
// Implement target: src/app/(main)/categories/[category]/category-page.int.test.ts
// Covers: src/app/(main)/categories/[category]/page.tsx -> CategoryPLP (initialProducts prop, per-route SSR data contract)
//
// ---------------------------------------------------------------------------
// AC-004: "WHEN a cold request is made to a category URL, THE SYSTEM SHALL
// return initial HTML containing the first page of products before client
// JS executes" (PRD SF-3; UI Spec S-03 "Cold request (SSR), page 1")
// ROI: 71 (BV:8 x Freq:8 + Legal:0 + Defect:7)
// Behavior: `categories/[category]/page.tsx` performs a blocking RSC fetch
// (`await getClient().query(ProductsDocument, buildProductsListingVariables({ category, page: 1 }))`)
// and passes the result as `initialProducts` into `CategoryPLP`, which
// renders that page-1 product set on first paint instead of a skeleton.
// @category: core-functionality
// @lane: integration
// @dependency: category-page RSC entry (mocked getClient/apollo-rsc call), CategoryPLP / ProductListing (initialProducts prop), query-variables buildProductsListingVariables
// @complexity: medium
// Primary failure mode: the route still delegates entirely to the
// client-only `CategoryPLP`/`ProductListing` with no `initialProducts`
// seeded, so the render before hydration shows `ProductListingSkeleton`
// instead of real page-1 product cards.
// Proof obligation: invoke the route's async server entry (or render
// `CategoryPLP`/`ProductListing` with `initialProducts` populated from a
// mocked server-side fetch and the client `useQuery` not yet settled) for
// a known category slug + mocked product fixture, and assert the returned
// markup/render contains the expected product names/count for page 1 and
// does not contain `ProductListingSkeleton`.
// Verification points / expected results / pass criteria:
//   - Render contains the mocked page-1 product set (exact count and at
//     least one known product name) sourced from `initialProducts`, not
//     from a client-triggered refetch.
//   - `ProductListingSkeleton` is absent from that render.
//   - Existing "no products" empty-state and error-UI paths (unchanged
//     baseline) still render correctly when the mocked fetch returns zero
//     items / rejects — confirms the SSR conversion did not regress the
//     pre-existing empty/error branches.
//   - Fail if the skeleton renders, if product count/identity differs from
//     the mocked fixture, or if the empty/error branches regress.
