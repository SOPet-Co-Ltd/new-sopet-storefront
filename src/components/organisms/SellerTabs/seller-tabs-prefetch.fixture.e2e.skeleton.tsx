// SellerTabs Hover-Prefetch Journey [fixture-e2e] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (Component: SellerTabs; UI-P4 trigger #4)
// Generated: 2026-07-09 | Budget Used (Storefront Prefetch feature): integration 0/3, fixture-e2e 2/3 (this file is the additional slot, ROI 35 >= 20), service-e2e 0/2
//
// Implement target: src/components/organisms/SellerTabs/seller-tabs-prefetch.fixture.e2e.test.tsx
// Covers: src/components/organisms/SellerTabs/SellerTabs.tsx (SellerTabs tab nav extended with onMouseEnter/onFocus prefetch handlers, lines ~61-63)
//         -> src/lib/catalog/prefetchProductsListing.ts (scoped to seller/tab, cache-first, de-duplicated)
//
// ---------------------------------------------------------------------------
// AC-006: "WHEN a shopper hovers or focuses a seller tab (`SellerTabs`),
// THE SYSTEM SHALL call the appropriate prefetch (`prefetchProductsListing`
// scoped to that seller/tab) before the tab is clicked, de-duplicated, with
// no visible change to the tab" (PRD SF-5; UI Spec "Component: SellerTabs")
// ROI: 35 (BV:5 x Freq:6 + Legal:0 + Defect:5)
// Behavior: on a seller storefront page, hovering/focusing a non-active
// tab triggers a de-duplicated `prefetchProductsListing` scoped to that
// seller + tab; clicking through then renders from the warm cache
// (existing skeleton only applies if the tab was not prefetched, per UI
// Spec "Tab switch" row).
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (SellerTabs, prefetchProductsListing), mocked GraphQL transport (call-count assertion on ProductsDocument scoped to the seller/tab variables)
// @complexity: medium
// Primary failure mode: the tab's hover/focus handler is wired to a
// generic listing prefetch that omits the seller-scope variable, so the
// prefetch either targets the wrong data or is indistinguishable from an
// unscoped category prefetch, producing a cache-miss (and therefore the
// existing skeleton flashes) when the shopper actually switches tabs.
// Proof obligation: render `SellerTabs` for a known seller handle with a
// mocked GraphQL transport, fire `onMouseEnter`/`onFocus` on a non-active
// tab and assert the mocked `ProductsDocument` resolver is invoked exactly
// once with variables scoped to that seller + tab, with zero DOM/class/
// style change on the tab itself; then switch to that tab and assert its
// listing renders from the warm cache without the existing
// per-tab-not-prefetched skeleton branch engaging, and with no additional
// resolver invocation.
// Verification points / expected results / pass criteria:
//   - Hover/focus on a non-active tab invokes the mocked resolver exactly
//     once with the seller+tab-scoped variables.
//   - No DOM/class/style change on the tab as a direct result of the
//     hover/focus trigger (UI-P4 no-visible-affordance guard).
//   - Switching to the prefetched tab renders its listing without
//     engaging the existing "not prefetched" skeleton branch, and without
//     a second resolver invocation for the same variables.
//   - Fail if the prefetch call omits/mismatches the seller+tab scope, if
//     the skeleton engages after switching to an already-prefetched tab,
//     or if any visible affordance appears on hover.
