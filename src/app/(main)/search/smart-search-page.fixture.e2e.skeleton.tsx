// Smart Search Results Hydration [fixture-e2e] Test Skeleton - Design Doc: smart-search-frontend-design.md
// UI Spec: smart-search-ui-spec.md (S-02 Search Results, AC-035, AC-037)
// Generated: 2026-07-10 | Budget Used (Smart Search feature): integration 3/3, fixture-e2e 2/3
//
// Implement target: src/app/(main)/search/smart-search-page.fixture.e2e.test.tsx
// Covers: src/app/(main)/search/page.tsx → SearchResultsPage → ProductListing (initialProducts)
// Note: distinct from performance-optimization `search-page.fixture.e2e.skeleton.tsx` (cold SSR
// presence). This skeleton guards Smart Search ranking order stability + sessionId cookie parity.
//
// User decision: SSR passes sessionId via cookie on server and client.
//
// ---------------------------------------------------------------------------
// AC-037: "WHEN SSR requests search results, THE SYSTEM SHALL return stable ranking for
// identical inputs (deterministic SQL ordering tie-breakers)" AND no hydration reorder flash
// AC-035: server-ranked results displayed without client-side re-ranking
// ROI: 86 (BV:9 × Freq:8 + Legal:0 + Defect:7)
// Behavior: cold render of `/search?q=อาหารแมว` with cookie `sopet_session_id` present shows
// product grid in Smart Search order from `initialProducts`; after hydration tick, same id
// sequence visible; MSW/Apollo cache does not reshuffle items client-side.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked Products query with deliberate non-alphabetical id order), search page RSC entry, cookie sessionId on SSR + client
// @complexity: high
// Primary failure mode: client refetch replaces SSR order, sessionId mismatch triggers different
// ranking, or ProductListing applies local sort when `sortBy=relevance`.
// Proof obligation: mock Products response order `['prod-c','prod-a','prod-b']` for fixed `q`;
// render search page with initialProducts + cookie; capture first paint DOM order; advance
// hydration; assert order unchanged; assert GraphQL variables on SSR and client both include
// same sessionId from cookie and equivalent search/filter/sort encoding.
// Verification points / expected results / pass criteria:
//   - First paint product order matches mocked Smart Search order.
//   - Post-hydration order identical (no flash/reorder).
//   - sessionId present in SSR and client requests via cookie.
//   - Fail if sequence changes or client re-sorts relevance results.
