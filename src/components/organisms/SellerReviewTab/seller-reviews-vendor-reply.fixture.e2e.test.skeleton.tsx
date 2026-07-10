// Product Reviews Vendor Reply — Seller Tab [fixture-e2e] Test Skeleton - Design Doc: product-reviews-vendor-reply-frontend-design.md
// Backend Design Doc: product-reviews-vendor-reply-backend-design.md | UI Spec: product-reviews-vendor-reply-ui-spec.md
// Generated: 2026-07-10 | Budget Used (feature): integration 3/3 (backend), fixture-e2e 2/3 (this file), service-e2e 1/2 (backend)
//
// Implement target: src/components/organisms/SellerReviewTab/seller-reviews-vendor-reply.fixture.e2e.test.tsx
//
// Covers:
//   src/components/organisms/SellerReviewTab/SellerReviewTab.tsx
//   src/components/molecules/SellerStoreReviewList/SellerStoreReviewList.tsx (new)
//   src/components/molecules/SellerStoreReviewListItem/SellerStoreReviewListItem.tsx (new)
//   src/components/molecules/VendorReplyBlock/VendorReplyBlock.tsx (reuse)
//   src/components/molecules/ProductThumbnail/ProductThumbnail.tsx (new)
//   src/lib/hooks/useReviews.ts (storeReviews + storeReviewSummary branches)
//   src/lib/graphql/operations/reviews.graphql (StoreReviews query — public, not storeProductReviews)
//
// Harness: Vitest + RTL + MSW; mock StoreReviews + StoreReviewSummary; next/image stub.
//
// Test Boundaries compliance (Frontend Design Doc):
// Mock: GraphQL transport (MSW)
// No mock: client-side pagination slice (10/page)
//
// User focus journey #3: Customer sees individual reviews on seller tab
//
// ---------------------------------------------------------------------------
// AC-018: "WHEN store has approved reviews, THEN seller tab shall fetch `storeReviews`, show
// `SellerScore` in left column and paginated individual reviews (80×80 thumbnail, product link,
// customer content, optional `VendorReplyBlock`) in right column"
// AC-020: "Aggregate summary visible alongside individual list"
// AC-012 / AC-013 (seller row): optional VendorReplyBlock when reply present; omitted when null
// ROI: 80 (BV:8 × Freq:8 + Legal:0 + Defect:8)
// Behavior: tab load triggers public `storeReviews` (no Authorization); left column shows
// SellerScore average + total; right column lists individual rows with product thumbnail/name link,
// customer stars/comment, and VendorReplyBlock only for rows with reply; pagination shows page 2
// rows with replies still nested per item.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (SellerReviewTab, SellerStoreReviewList), mocked storeReviews + storeReviewSummary
// @complexity: high
// Primary failure mode: seller tab still shows product breakdown only; calls vendor-guarded
// storeProductReviews (401); summary missing; list omits thumbnails or replies; pagination drops reply.
// Proof obligation: MSW StoreReviews returns ≥11 reviews (one with reply, one without) + summary;
// render SellerReviewTab with storeId; assert heading "รีวิวจากลูกค้า", SellerScore text from summary,
// row count on page 1 = 10; assert product link href uses productSlug when set; assert VendorReplyBlock
// only on replied row; advance pagination — reply stays with correct product name.
// Boundary path: paginate beyond first page (client slice boundary).
// Verification points / expected results / pass criteria:
//   - storeReviews MSW handler invoked (not StoreProductReviews).
//   - SellerScore + individual list both visible (AC-020).
//   - Rows show 80×80 thumbnail area, product name, customer content.
//   - VendorReplyBlock present only when reply non-null.
//   - Pagination changes visible rows without losing reply pairing.
//   - Fail if breakdown-only UI, wrong query name, or missing summary sidebar.
//
// ---------------------------------------------------------------------------
// AC-019: "WHEN store has no reviews, THEN list area shall show `ยังไม่มีรีวิว`"
// ROI: 42 (BV:6 × Freq:6 + Legal:0 + Defect:6) — included in same file as boundary empty-state case
// Behavior: MSW returns storeReviews: [] with summary zeros; list area shows Thai empty copy;
// SellerScore still renders in left column.
// @category: edge-case
// @lane: fixture-e2e
// @dependency: SellerReviewTab, mocked empty storeReviews
// @complexity: low
// Primary failure mode: empty API shows error state or blank without copy; breakdown table shown instead.
// Proof obligation: render with empty array; assert "ยังไม่มีรีวิว" in list column; no review rows.
// Verification points / expected results / pass criteria:
//   - Empty copy visible in right column.
//   - No SellerStoreReviewListItem rows.
//   - Fail if error state or stale breakdown UI appears.
