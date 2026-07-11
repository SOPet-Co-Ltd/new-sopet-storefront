// Public Order Tracking Hook [integration] Test Skeleton - Design Doc: order-tracking-frontend.md
// Backend Design Doc: order-tracking-backend.md | UI Spec: order-tracking-page.md | PRD: order-tracking-page.md
// Generated: 2026-07-11 | Budget Used (feature): integration 3/3 (backend 2/3 in order-tracking.int.test.ts; this file 1/3), fixture-e2e 3/3 (see order-tracking.fixture.e2e.test.skeleton.tsx), service-e2e 0/2
//
// Implement target: src/lib/hooks/__tests__/useOrderTracking.int.test.ts (add executable imports,
// renderHook, MockedProvider/MSW, and assertions alongside useOrderTracking implementation)
//
// Covers:
//   src/lib/hooks/useOrderTracking.ts (queryState classifier + refetch)
//   src/lib/graphql/operations/orderTracking.graphql (OrderTrackingDocument)
//
// Harness: Vitest + @testing-library/react renderHook + MSW (existing `src/test/mocks/handlers.ts`
// pattern) or MockedProvider with GraphQL error fixtures; no useAuth mock required (public query).
//
// Test Boundaries compliance (Frontend Design Doc "Mock Boundary Decisions"):
// Mock: GraphQL transport (MSW / MockedProvider)
// No mock: useOrderTracking classification logic (real hook under test)
//
// Skipped ACs (covered elsewhere):
//   AC-001–AC-004 page content rendering → order-tracking.fixture.e2e.test.skeleton.tsx
//   AC-020–AC-022 keyboard/focus → fixture-e2e or manual a11y spot-check
//   Admin vendor menu AC-011–AC-013 → admin unit tests (out of storefront integration scope)
//
// ---------------------------------------------------------------------------
// AC-016: "WHEN the route param is empty, malformed, or the API returns `ORDER_NOT_FOUND`, the
// system shall render identical not-found copy with no format-vs-existence distinction."
// AC-015 (contrast): "WHEN the query fails with network or non-not-found GraphQL error, the
// system shall show the error state with a retry button that refetches the query."
// AC (hook contract): empty `orderNumber` → `not-found` without network call; GraphQL
// `extensions.code === 'ORDER_NOT_FOUND'` → `not-found`; `error.networkError` → `error`;
// successful `data.orderTracking` → `success`.
// ROI: 90 (BV:9 × Freq:9 + Legal:0 + Defect:9)
// Behavior: renderHook useOrderTracking with four isolated scenarios — (1) undefined/whitespace
// orderNumber yields queryState.status 'not-found' and OrderTracking MSW handler never invoked;
// (2) MockedProvider/MSW returns GraphQL error extensions.code ORDER_NOT_FOUND → 'not-found';
// (3) networkError fixture → 'error'; (4) success fixture → 'success' with data.orderNumber
// literal matching MSW payload. refetch exposed and callable from error path (wired in fixture-e2e).
// @category: core-functionality
// @lane: integration
// @dependency: useOrderTracking, OrderTrackingDocument, MSW or MockedProvider, Apollo test wrapper
// @complexity: medium
// Primary failure mode: ORDER_NOT_FOUND routed to 'error' (enumeration risk downstream); empty param
// triggers fetch; network errors conflated with not-found; success misclassified.
// Proof obligation: for each scenario arrange deterministic Apollo outcome; assert queryState.status
// only (no page component); spy MSW handler call count — must be 0 when orderNumber blank after trim;
// ORDER_NOT_FOUND and garbage-order success-not-found both map to same status enum value 'not-found'
// (page copy equality verified in fixture-e2e). Network error must map to 'error', not 'not-found'.
// Boundary path: ORDER_NOT_FOUND vs networkError branch — main path alone would stay green if both
// map to same status; test must exercise both branches.
// Verification points / expected results / pass criteria:
//   - Empty/whitespace orderNumber → status 'not-found'; zero GraphQL requests.
//   - ORDER_NOT_FOUND GraphQL error → status 'not-found'.
//   - networkError → status 'error' (not 'not-found').
//   - Success payload → status 'success' with matching orderNumber in data.
//   - Fail if classification swaps not-found and error, or empty param fetches.
