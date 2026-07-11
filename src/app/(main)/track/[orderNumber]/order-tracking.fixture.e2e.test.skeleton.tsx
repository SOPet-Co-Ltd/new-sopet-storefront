// Public Order Tracking Page [fixture-e2e] Test Skeleton - Design Doc: order-tracking-frontend.md
// Backend Design Doc: order-tracking-backend.md | UI Spec: order-tracking-page.md | PRD: order-tracking-page.md
// Generated: 2026-07-11 | Budget Used (feature): integration 3/3 (backend + hook), fixture-e2e 3/3 (this file), service-e2e 0/2
//
// Implement target: src/app/(main)/track/[orderNumber]/order-tracking.fixture.e2e.test.tsx
// (Add executable imports, describe/it, MSW handlers, and assertions alongside track page implementation.)
//
// Covers:
//   src/app/(main)/track/[orderNumber]/page.tsx (OrderTrackingPage route shell)
//   src/components/order-tracking/order-tracking-page-content.tsx (state router)
//   src/components/order-tracking/order-tracking-loading-state.tsx
//   src/components/order-tracking/order-tracking-not-found-state.tsx
//   src/components/order-tracking/order-tracking-error-state.tsx
//   src/components/order-tracking/order-tracking-status-header.tsx
//   src/components/order-tracking/order-shipment-tracking-list.tsx
//   src/components/organisms/OrderConfirmationSummary/OrderConfirmationSummary.tsx (hideHeader)
//   src/lib/hooks/useOrderTracking.ts (integration with page)
//
// Harness: Vitest + RTL + MSW; mock next/navigation useParams; stub next/image; Apollo test wrapper;
// no live backend (fixture-driven GraphQL only).
//
// Test Boundaries compliance (Frontend Design Doc):
// Mock: GraphQL orderTracking transport (MSW)
// No mock: OrderTrackingPageContent state router, Thai copy from UI Spec
//
// User-facing multi-step journey reserved slot: visit /track/{orderNumber} → public fetch → content stack
//
// ---------------------------------------------------------------------------
// AC-001: "WHEN a user visits `/track/{validOrderNumber}` without authentication, the system shall
// render the page inside `(main)` layout showing order number, Thai status label, and created date."
// AC-002: "WHEN order data loads successfully, the system shall display line items (name, image,
// quantity, unit price, subtotal), totals, shipping option names, and carrier links when `trackingUrl`
// is present."
// AC-003: "WHEN order data loads successfully, the system shall display totals and shipping option names."
// AC-004: "WHEN item has trackingUrl, carrier link is clickable with external rel."
// AC-005: "WHEN any content state renders, the system shall not display shipping address, customer
// name, phone, email, or guest fields."
// AC-007: "WHEN the tracking page renders, the system shall not offer pay, confirm delivery, or review actions."
// AC-019: "WHEN status displays, reuse ORDER_STATUS_LABELS and AccountStatusBadge."
// ROI: 109 (BV:10 × Freq:10 + Legal:0 + Defect:9) — RESERVED fixture-e2e slot (user-facing journey)
// Behavior: render OrderTrackingPage (or page + content stack) with useParams orderNumber
// `ORD-SEED-001` and MSW OrderTracking success fixture; without auth mock user; assert Thai status
// label for seeded status, order number text, formatted created date, line item name/qty/price,
// totals row, shipping option name, external tracking link when trackingUrl set; assert DOM absent
// guest/address/payment CTAs (pay, confirm delivery, review buttons); PII negative assertions on DOM.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (track route + OrderTrackingPageContent + summary + shipment list), mocked orderTracking GraphQL
// @complexity: high
// Primary failure mode: page stuck on loading; PII fields rendered; authenticated CTAs visible;
// shipment link missing; status badge wrong Thai label; duplicate order number header when hideHeader omitted.
// Proof obligation: MSW returns OrderTrackingType fixture with one item (productImageUrl, trackingUrl),
// storeShippings, totals, status `paid`; mount page tree; waitFor content state; assert status badge
// text from ORDER_STATUS_LABELS; assert item and total literals; queryByText for forbidden PII strings
// (seed values only in MSW metadata, never in rendered DOM); queryByRole for pay/confirm/review absent;
// carrier link has href matching trackingUrl and rel includes noopener noreferrer.
// Boundary path: success path with trackingUrl present (AC-004) — omitted link if main path skips shipment card.
// Verification points / expected results / pass criteria:
//   - Order number, Thai status, created date visible.
//   - Line items, totals, shipping option name visible.
//   - Tracking link present when trackingUrl in fixture.
//   - No PII strings, no pay/confirm/review actions in DOM.
//   - Fail if loading skeleton persists, PII leaks, or CTAs appear.
//
// ---------------------------------------------------------------------------
// AC-016: "WHEN the route param is empty, malformed, or the API returns `ORDER_NOT_FOUND`, the
// system shall render identical not-found copy with no format-vs-existence distinction."
// AC-014 (contrast guard): loading vs not-found — not-found must not show error retry UI.
// ROI: 81 (BV:9 × Freq:8 + Legal:0 + Defect:9)
// Behavior: two renders with same assertion target — (1) useParams `ORD-GARBAGE` + MSW GraphQL error
// ORDER_NOT_FOUND; (2) useParams `not-a-real-format` + same MSW error; optionally (3) empty param
// hook short-circuit. Assert identical heading `ไม่พบคำสั่งซื้อ` and body copy per UI Spec; assert
// no distinct "invalid format" message; assert error retry button absent; home link `กลับหน้าหลัก` present.
// @category: edge-case
// @lane: fixture-e2e
// @dependency: OrderTrackingPageContent + OrderTrackingNotFoundState, mocked ORDER_NOT_FOUND
// @complexity: medium
// Primary failure mode: different copy for malformed vs missing; error state shown instead of not-found;
// client-side ORD-* regex branch with distinct message (prohibited by UI Spec).
// Proof obligation: capture textContent for not-found container in both scenarios; expect strict equality;
// assert role="alert" on not-found block; assert `ลองอีกครั้ง` retry button not in document.
// Boundary path: malformed param vs ORDER_NOT_FOUND API — must produce identical UI (anti-enumeration).
// Verification points / expected results / pass criteria:
//   - Identical heading and body for garbage param and ORDER_NOT_FOUND API.
//   - No retry button; no format-specific hint text.
//   - Fail if copy differs between cases or error state renders.
//
// ---------------------------------------------------------------------------
// AC-015: "WHEN the query fails with network or non-not-found GraphQL error, the system shall show
// the error state with a retry button that refetches the query."
// AC-014: "WHILE `orderTracking` is loading, the system shall show a skeleton inside the content
// column with navbar and footer visible and `aria-busy=\"true\"`." — exercised on retry transition.
// ROI: 64 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: MSW simulates network failure on first OrderTracking request; render page; assert error
// heading `ไม่สามารถโหลดข้อมูลได้` and retry button `ลองอีกครั้ง`; click retry → MSW succeeds on
// second call → content state with order number visible; assert refetch invoked (handler call count 2).
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: OrderTrackingPage + OrderTrackingErrorState + useOrderTracking refetch, MSW network error then success
// @complexity: medium
// Primary failure mode: network error shows not-found; retry no-op; order data leaked on error state.
// Proof obligation: first handler returns network error; user clicks retry; second handler returns success
// fixture; assert transition error → loading (aria-busy optional) → success; no order data on error screen.
// Boundary path: retry click must re-enter loading before success or error (AC-015 retry wiring).
// Verification points / expected results / pass criteria:
//   - Error copy and retry button visible on network failure.
//   - No order line items on error screen.
//   - Retry triggers second fetch and success content appears.
//   - Fail if retry ignored, not-found shown, or data leaked on error.
