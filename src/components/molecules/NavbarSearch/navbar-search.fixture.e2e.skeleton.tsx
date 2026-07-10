// Navbar Smart Search Autocomplete [fixture-e2e RESERVED] Test Skeleton - Design Doc: smart-search-frontend-design.md
// UI Spec: smart-search-ui-spec.md (S-01 NavbarSearch, AC-024–027)
// PRD: smart-search-prd.md
// Generated: 2026-07-10 | Budget Used (Smart Search feature): integration 3/3 (storefront), fixture-e2e 1/3 (RESERVED slot), service-e2e 2/2
//
// Implement target: src/components/molecules/NavbarSearch/navbar-search.fixture.e2e.test.tsx
// Covers: NavbarSearch → SearchSuggestionsDropdown → SearchSuggestionListbox → SearchRecentSection
//         useSearchSuggestions, useRecentSearches, useNavbarSearchCombobox
// User decisions: recent searches P1 (empty focus chips); text-only product suggestions (no thumbnails).
//
// RESERVED fixture-e2e slot: highest-ROI user-facing multi-step journey (navbar discover → navigate).
//
// Existing coverage dedup: AC-027 Enter submit baseline in NavbarSearch.test.tsx — this file
// focuses on autocomplete/select paths, not bare submit regression.
//
// ---------------------------------------------------------------------------
// AC-024: "WHEN the shopper types ≥2 characters and debounce elapses, THE SYSTEM SHALL
// fetch `searchSuggestions` and open the dropdown with product and query sections"
// AC-025: "WHEN the dropdown is open, THE SYSTEM SHALL support Arrow Up/Down, Home/End,
// Enter, and Escape per combobox pattern"
// AC-026: "WHEN the shopper activates a product suggestion, navigate `/product/[id]` and
// persist query in recent searches; query suggestion → `/search?q=...`"
// P1 empty focus: recent search chips from sessionStorage when input focused and empty
// ROI: 109 (BV:10 × Freq:10 + Legal:0 + Defect:9) — RESERVED journey
// Behavior: (journey A) focus empty input → recent chips visible → activate chip →
// `/search?q=`; (journey B) type "ro" → debounce → MSW suggestions → ArrowDown → Enter on
// product row → `/product/{id}` + recent search saved; (journey C) Arrow to query row →
// `/search?q=`; Escape closes dropdown; text-only rows (no img/thumbnail elements).
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked GraphQL searchSuggestions), real sessionStorage, NavbarSearch combobox tree
// @complexity: high
// Primary failure mode: debounce not applied, listbox keyboard inert, wrong navigation target
// by suggestion type, thumbnails rendered despite text-only contract, recent searches not
// persisted on selection.
// Proof obligation: pre-seed sessionStorage; MSW fixture with one product `{id,name,slug}` and
// one query suggestion; drive userEvent keyboard/mouse through each journey; assert router.push
// targets and sessionStorage `sopet_recent_searches` contents; assert `role=combobox`,
// `aria-expanded`, `aria-activedescendant` during navigation; assert zero `img` in product
// suggestion rows.
// Verification points / expected results / pass criteria:
//   - Dropdown opens after debounce when query length ≥2; MSW receives sessionId.
//   - Arrow/Home/End/Enter/Escape behave per WCAG combobox pattern.
//   - Product select → `/product/[id]`; query select → `/search?q=...`; recent search updated.
//   - Empty focus shows recent chips (P1); text-only suggestion rows.
//   - Fail on keyboard noop, wrong route, or thumbnail rendering.
