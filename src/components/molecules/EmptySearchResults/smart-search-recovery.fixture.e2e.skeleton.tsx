// Zero-Result Recovery Chips [fixture-e2e] Test Skeleton - Design Doc: smart-search-frontend-design.md
// UI Spec: smart-search-ui-spec.md (S-02 EmptySearchResults, AC-036)
// PRD: smart-search-prd.md | Backend: searchRecoverySuggestions (analytics-driven per user decision)
// Generated: 2026-07-10 | Budget Used (Smart Search feature): integration 3/3, fixture-e2e 3/3
//
// Implement target: src/components/molecules/EmptySearchResults/smart-search-recovery.fixture.e2e.test.tsx
// Covers: EmptySearchResults → SuggestedQueryChips → useSearchRecoverySuggestions
//         ProductListing zero-result branch on `/search?q=...`
//
// ---------------------------------------------------------------------------
// AC-036: "WHEN search returns zero products, THE SYSTEM SHALL display analytics-driven
// suggested query chips above category links"
// ROI: 72 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Products MSW returns `total:0`; `searchRecoverySuggestions` MSW returns
// `["อาหารแมว", "ทรายแมว"]`; empty state shows chip links above existing category section;
// clicking chip navigates to `/search?q=` with encoded query (S-02 → S-02 transition).
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked Products + searchRecoverySuggestions), EmptySearchResults extension, router mock
// @complexity: medium
// Primary failure mode: chips omitted when API returns suggestions, wrong placement below
// categories, navigation does not update search URL, or API failure breaks category empty state.
// Proof obligation: render search results with zero products and nonzero recovery fixture;
// assert chip labels and hrefs; click second chip → assert router receives `/search?q=%E0%B8%97%E0%B8%A3%E0%B8%B2%E0%B8%A2%E0%B9%81%E0%B8%A1%E0%B8%A7`;
// stub recovery API error → assert chips hidden but category links remain (UI Spec error row).
// Verification points / expected results / pass criteria:
//   - Suggested query chips render above category links when recovery API returns data.
//   - Chip click navigates to new search URL with encoded query.
//   - Recovery API failure hides chips only; categories still visible.
//   - Fail if chips missing with data, wrong nav, or categories regressed.
