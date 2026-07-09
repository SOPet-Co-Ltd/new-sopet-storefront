// PDP Warm-Cache Navigation Journey [fixture-e2e RESERVED] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (S-01->S-02 transition; S-02 / ProductDetailsPage)
// Generated: 2026-07-09 | Budget Used: integration 3/3, fixture-e2e 3/3 (this file is the RESERVED user-facing multi-step journey slot), service-e2e 0/2
//
// Implement target: src/app/(main)/product/[id]/product-page.fixture.e2e.test.tsx
// Covers: src/components/organisms/ProductCard.tsx (hover/focus/viewport prefetch, lines ~145-185)
//         -> src/lib/catalog/prefetchProduct.ts (prefetchProductById, cache-first, de-duplicated)
//         -> src/app/(main)/product/[id]/page.tsx -> ProductDetailsPage (initialProduct SSR prop + warm Apollo cache)
//
// This is the reserved fixture-e2e slot for this feature: the only
// genuine multi-step, user-facing journey among the SSR ACs (hover/focus a
// product card -> navigate -> land on a fully-rendered PDP with zero
// additional network activity), spanning two components + the shared
// Apollo cache. Emitted regardless of ROI ranking per budget rules.
//
// ---------------------------------------------------------------------------
// AC-003: "WHEN a shopper navigates from a `ProductCard` that was already
// hover/viewport-prefetched, THE SYSTEM SHALL render full product content
// with zero additional network request" (PRD SF-2; UI Spec S-02 "Navigated
// from prefetched ProductCard" row)
// ROI: 71 (BV:8 x Freq:8 + Legal:0 + Defect:7)
// Behavior: shopper hovers/focuses a `ProductCard` (fires `prefetchProductById`,
// cache-first, de-duplicated) -> clicks through to `/product/[id]` -> the
// PDP's primary product block renders immediately from the now-warm Apollo
// cache (further reinforced by SSR hydration), with the inline
// `ProductDetailsSkeleton` never mounting and no second network call for
// the same product-by-id query+variables.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (ProductCard, prefetchProductById, shared Apollo cache, ProductDetailsPage), mocked GraphQL transport (fail-if-called-twice guard on ProductByIdDocument for the same id)
// @complexity: high
// Primary failure mode: the hover/focus prefetch trigger fires but writes
// into a cache instance the PDP's `useProduct`/SSR path does not read from
// (cache instance mismatch, or prefetch dedupe key mismatch with the PDP's
// query variables), so navigating to the PDP still shows
// `ProductDetailsSkeleton` and issues a second network request for the
// same product.
// Proof obligation: within one test, (1) render a component containing a
// `ProductCard` for a known product id and fire `onMouseEnter`/`onFocus`,
// asserting the mocked `ProductByIdDocument` resolver is invoked exactly
// once (the prefetch call) -- this is the AC-006 prefetch-trigger proof
// folded into this journey rather than duplicated as a separate test; then
// (2) render/navigate to the PDP for that same product id against the
// now-warm shared cache with the mocked transport configured to fail the
// test if `ProductByIdDocument` is called again for that id, and assert
// full product content renders with `ProductDetailsSkeleton` never
// mounting.
// Verification points / expected results / pass criteria:
//   - Step 1 (prefetch trigger): hovering/focusing `ProductCard` calls
//     `prefetchProductById`/invokes the mocked resolver exactly once for
//     the product id, with zero DOM/class/style change on the card itself
//     (UI-P4 no-visible-affordance guard).
//   - Step 2 (navigation): the PDP render for that same product id
//     contains full product content (name, price, primary image) sourced
//     from the warm cache, `ProductDetailsSkeleton` never mounts, and the
//     mocked `ProductByIdDocument` resolver records exactly the one
//     invocation from Step 1 (zero additional calls).
//   - Fail if the resolver is called more than once total across both
//     steps, if the skeleton mounts during PDP render, or if hovering
//     produces any visible DOM/style change.
