// Pagination Hover-Prefetch Journey [fixture-e2e RESERVED] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (Component: Pagination; UI-P4 trigger #3)
// Generated: 2026-07-09 | Budget Used (Storefront Prefetch feature): integration 0/3, fixture-e2e 2/3 (this file is the RESERVED slot), service-e2e 0/2
//
// Implement target: src/components/molecules/Pagination/pagination-prefetch.fixture.e2e.test.tsx
// Covers: src/components/molecules/Pagination/Pagination.tsx (extended with onMouseEnter/onFocus prefetch handlers)
//         -> src/lib/catalog/prefetchProductsListing.ts (cache-first, de-duplicated)
//         -> src/components/sections/ProductListing/ProductListing.tsx (client-side page navigation, ProductListingSkeleton)
//
// This is the reserved fixture-e2e slot for the Storefront Prefetch
// feature: the clearest multi-step, user-facing journey among the SF-5
// prefetch triggers (hover an enabled pagination control -> click it ->
// the next page renders without its normal loading state), representative
// of the shared `prefetchProductsListing` de-duplication mechanism reused
// by CategoryCard/SellerTabs/nav-link triggers.
//
// ---------------------------------------------------------------------------
// AC-006: "WHEN a shopper hovers or focuses an enabled pagination control,
// THE SYSTEM SHALL call `prefetchProductsListing` for the adjacent target
// page with current filters/sort, de-duplicated against in-flight/completed
// prefetches, with no visible change to the button" (PRD SF-5; UI Spec
// "Component: Pagination")
// ROI: 60 (BV:6 x Freq:9 + Legal:0 + Defect:6)
// Behavior: shopper hovers/focuses the "next page" pagination control on a
// category/search/seller listing -> `prefetchProductsListing` fires once
// for that page+current filters, de-duplicated -> shopper clicks -> page N
// renders immediately from the warm cache with `ProductListingSkeleton`
// never mounting and no additional network request for that page.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (Pagination, prefetchProductsListing, ProductListing), mocked GraphQL transport (fail-if-called-twice guard on ProductsDocument for the target page's variables)
// @complexity: medium
// Primary failure mode: the new hover/focus handler is wired but calls
// `prefetchProductsListing` with variables that don't exactly match what
// `ProductListing`'s own `useQuery` uses for that page (e.g. missing
// current sort/filter params), so the prefetch is a cache-miss decoy and
// clicking still shows `ProductListingSkeleton` and issues a fresh network
// call.
// Proof obligation: render `ProductListing` (or its parent listing
// section) with a mocked GraphQL transport, fire `onMouseEnter`/`onFocus`
// on the enabled "next page" `Pagination` control and assert the mocked
// `ProductsDocument` resolver is invoked exactly once with the expected
// page-N variables (matching current filters/sort) and that no new DOM
// node/class/style appears on the control as a result; then trigger the
// page-change (click) and assert page N renders from the warm cache
// (`ProductListingSkeleton` never mounts) with the resolver still recording
// only that one prior invocation (zero additional calls after the click).
// Also assert a disabled pagination control (already at first/last page)
// does not trigger the prefetch on hover, matching the existing `onClick`
// guard logic.
// Verification points / expected results / pass criteria:
//   - Hover/focus on an enabled control invokes the mocked resolver
//     exactly once with the page-N variables matching current filters/
//     sort; disabled controls invoke it zero times.
//   - No DOM/class/style change on the pagination control as a direct
//     result of the hover/focus trigger (UI-P4 no-visible-affordance
//     guard).
//   - After the click-through page change, `ProductListingSkeleton` never
//     mounts, and the resolver records no additional invocation beyond
//     the one from the prefetch trigger.
//   - Fail if the resolver's prefetch call uses mismatched variables (cache
//     miss on click), if the skeleton renders after the click, if a
//     disabled control triggers a prefetch, or if any visible affordance
//     appears on hover.
