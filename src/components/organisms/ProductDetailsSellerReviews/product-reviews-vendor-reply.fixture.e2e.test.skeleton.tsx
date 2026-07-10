// Product Reviews Vendor Reply — PDP [fixture-e2e] Test Skeleton - Design Doc: product-reviews-vendor-reply-frontend-design.md
// Backend Design Doc: product-reviews-vendor-reply-backend-design.md | UI Spec: product-reviews-vendor-reply-ui-spec.md
// Generated: 2026-07-10 | Budget Used (feature): integration 3/3 (backend), fixture-e2e 1/3 (RESERVED slot, this file), service-e2e 1/2 (backend)
//
// Implement target: src/components/organisms/ProductDetailsSellerReviews/product-reviews-vendor-reply.fixture.e2e.test.tsx
//
// Covers:
//   src/components/organisms/ProductDetailsSellerReviews/ProductDetailsSellerReviews.tsx
//   src/components/molecules/VendorReplyBlock/VendorReplyBlock.tsx (new)
//   ProductReviewItem extraction (new)
//   src/lib/hooks/useReviews.ts (productReviews with nested reply)
//   src/lib/graphql/operations/reviews.graphql (ProductReviews reply selection)
//
// Harness: Vitest + RTL + MSW (extend src/test/mocks/handlers.ts + fixtures/catalog.ts);
// Apollo test wrapper per createApolloTestWrapper pattern.
//
// Test Boundaries compliance (Frontend Design Doc):
// Mock: GraphQL transport (MSW)
// No mock: filter/pagination client state (real useState in component)
//
// User focus journey #2: Customer sees vendor reply on PDP
//
// ---------------------------------------------------------------------------
// AC-012: "WHEN approved review includes non-null `reply`, THEN `ProductReviewItem` shall
// render customer block followed by `VendorReplyBlock` inside the same `<article>`"
// AC-013: "WHEN review has no `reply`, THEN no vendor block or placeholder shall render"
// AC-014: "WHEN shopper changes star filter or pagination, THEN each visible review shall keep
// its nested reply paired with the parent review"
// AC-009: "At most one nested reply per review"
// ROI: 89 (BV:9 × Freq:9 + Legal:0 + Defect:8) — RESERVED fixture-e2e slot (multi-step PDP journey:
// load reviews → apply star filter → paginate while reply stays nested under correct parent)
// Behavior: MSW returns mixed reviews (with/without reply); shopper activates 4-star filter then
// page 2; each visible `<article>` contains customer header + optional single VendorReplyBlock
// only when that review's reply is non-null; reply label "คำตอบจากผู้ขาย" and body text visible.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (ProductDetailsSellerReviews, VendorReplyBlock), mocked GraphQL ProductReviews handler
// @complexity: high
// Primary failure mode: VendorReplyBlock detached from parent on filter/page change; placeholder
// shown when reply null; duplicate reply blocks; reply body from review A shown under review B.
// Proof obligation: seed ≥6 reviews across ratings with known reply on one 4-star review; render
// component; assert reply block count equals reviews-with-reply on current page; click 4-star
// filter — assert only matching reviews visible and reply still under correct customer name;
// paginate — assert pairing invariant (data-testid or article-scoped queries); assert no
// VendorReplyBlock when reply null (AC-013).
// Boundary path: filter + pagination must exercise state transitions where wrong pairing regresses.
// Verification points / expected results / pass criteria:
//   - Review with reply: article contains "คำตอบจากผู้ขาย" + reply body; role="region".
//   - Review without reply: no vendor block, no empty placeholder.
//   - After filter and pagination, reply text still under same parent customer name.
//   - At most one vendor block per article.
//   - Fail if orphan reply, wrong pairing, or placeholder for null reply.
