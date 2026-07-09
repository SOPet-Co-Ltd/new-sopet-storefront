// Seller Storefront SSR Reconciliation [fixture-e2e] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (S-05 / SellerStorefront)
// Generated: 2026-07-09 | Budget Used: integration 3/3, fixture-e2e 3/3 (this file contributes 1, additional slot ROI>=20), service-e2e 0/2
//
// Implement target: src/app/(main)/sellers/[handle]/seller-page.fixture.e2e.test.tsx
// Covers: src/app/(main)/sellers/[handle]/page.tsx -> SellerStorefront (initialStore, initialProducts; src/components/organisms/SellerTabs/SellerTabs.tsx)
//
// ---------------------------------------------------------------------------
// AC-007: "WHEN a cold request is made to `/sellers/[handle]`, THE SYSTEM
// SHALL return initial HTML containing seller identity and first-page
// product content before client JS executes" (PRD SF-6; UI Spec S-05)
// ROI: 41 (BV:7 x Freq:5 + Legal:0 + Defect:6)
// Behavior: a shopper opens a seller storefront link (nav, seller
// directory, or direct URL); the server resolves the store lookup + first
// product-tab page via RSC fetch and seeds `initialStore`/`initialProducts`
// into `SellerStorefront`, so seller identity + products are visible on
// first paint instead of `SellerStorefrontSkeleton`.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked GraphQL transport for store-by-handle + ProductsDocument seller-tab variant), seller-page RSC entry, SellerStorefront/SellerTabs
// @complexity: medium
// Primary failure mode: `SellerStorefront` still resolves the store via
// its own client-side `useStore({ slug: handle })` with no `initialStore`
// seeded, so a cold request renders `SellerStorefrontSkeleton` (or the
// loading/error branch) before any client fetch completes, instead of
// seller identity + first-page products.
// Proof obligation: render the seller route/page tree for a known handle
// with the GraphQL transport mocked to return a store + first-page product
// fixture, and assert seller identity (name) and the mocked first-page
// products are present in the first rendered output, and that
// `SellerStorefrontSkeleton` never mounts for that cold load. Also assert
// the existing "seller not found" branch (unchanged) still renders when
// the mocked store lookup resolves to not-found.
// Verification points / expected results / pass criteria:
//   - First-paint render contains the mocked seller's identity text and
//     the mocked first-page product set, sourced from `initialStore`/
//     `initialProducts`, not a post-hydration client fetch.
//   - `SellerStorefrontSkeleton` is absent on this cold load.
//   - Existing seller-not-found / error UI (unchanged) still renders for
//     the corresponding mocked-fixture case.
//   - Fail if the skeleton renders on cold load, if identity/product
//     content is missing until after a simulated hydration tick, or if
//     the not-found/error branch regresses.
