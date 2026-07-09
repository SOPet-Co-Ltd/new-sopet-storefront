// Home SSR Reconciliation [integration] Test Skeleton - Design Doc: performance-optimization-frontend-design.md
// UI Spec: performance-optimization-ui-spec.md (S-01 / HomePage)
// Generated: 2026-07-09 | Budget Used: integration 3/3 (this file contributes 2), fixture-e2e 0/3, service-e2e 0/2
//
// Implement target: src/app/(main)/home-page.int.test.tsx
// Covers: src/app/(main)/page.tsx -> HomePage -> HomeCategories, HomeRecommendedProductSection
// New collaborators referenced (do not exist yet, per Design Doc "Existing Codebase Analysis"):
//   src/lib/graphql/apollo-rsc.ts (registerApolloClient/getClient), src/lib/graphql/query-variables.ts
//
// ---------------------------------------------------------------------------
// AC-001: "WHEN a cold (uncached) request is made to `/`, THE SYSTEM SHALL
// return initial HTML containing rendered product/section content for at
// least the first viewport" (PRD SF-1; UI Spec S-01 state matrix "Cold request (SSR)")
// ROI: 98 (BV:9 x Freq:10 + Legal:0 + Defect:8)
// Behavior: Cold request to `/` -> server-side getClient().query() resolves
// categories + recommended products -> initial HTML/render tree already
// contains section content, not the skeleton.
// @category: core-functionality
// @lane: integration
// @dependency: HomePage route composition (HomeCategories, HomeRecommendedProductSection), apollo-rsc getClient (mocked GraphQL response via MSW/mocked ApolloClient), query-variables builders
// @complexity: medium
// Primary failure mode: HomePage (or a converted section) still renders as
// 100%-client-fetch, so the server-produced markup contains only the
// skeleton (CategorySkeletonGrid/RecommendedSkeletonGrid) instead of real
// section content before any client `useQuery` resolves.
// Proof obligation: render the async route entry (or the composed section
// tree with `initialCategories`/`initialRecommendedProducts` populated from
// a mocked server fetch, and the client `useQuery` not yet resolved/mocked
// as pending) and assert the rendered output contains real category names
// and recommended product cards, and that neither `CategorySkeletonGrid`
// nor `RecommendedSkeletonGrid` is present in that same render. Mock the
// GraphQL transport only (MSW/mocked Apollo link); do not mock the section
// components themselves.
// Verification points / expected results / pass criteria:
//   - Rendered output (from `initial*` props, before any client refetch)
//     contains at least one real category name and one real recommended
//     product name/testid.
//   - `CategorySkeletonGrid` / `RecommendedSkeletonGrid` markup is absent
//     from that same render.
//   - Fail if either skeleton is present, or if section content is missing
//     and only a skeleton/empty state renders.
//
// ---------------------------------------------------------------------------
// AC-002: "WHEN client hydration completes after SSR, THE SYSTEM SHALL NOT
// issue a duplicate network request for any query/variable pair already
// satisfied server-side, and SHALL NOT render the section skeleton if
// hydrated data is present" (PRD SF-1; UI Spec S-01 "Post-hydration" row)
// ROI: 89 (BV:8 x Freq:10 + Legal:0 + Defect:9)
// Behavior: after the server-hydrated Apollo cache is seeded into the
// client, HomeCategories/HomeRecommendedProductSection's `useQuery` calls
// must report `loading: false` immediately (cache already warm) so no
// skeleton-flash is visible and no second network call fires for the same
// query+variables pair.
// @category: core-functionality
// @lane: integration
// @dependency: HomeCategories, HomeRecommendedProductSection, hydrated Apollo InMemoryCache (seeded via SSR-equivalent cache snapshot), mocked GraphQL transport (fail-if-called guard on the categories/recommended operations)
// @complexity: high
// Primary failure mode: the client-side `useQuery` briefly reports
// `loading: true` before Apollo recognizes the hydrated cache (a race
// between hydration and first client render), causing
// `CategorySkeletonGrid`/`RecommendedSkeletonGrid` to flash over already
// server-painted content, and/or a duplicate GraphQL request is fired for
// a query/variable pair the server already resolved.
// Proof obligation: seed an Apollo cache with the same normalized entities
// the server fetch would have produced (matching query+variables), mount
// the section components against that pre-hydrated cache with a mocked
// GraphQL link configured to fail the test if the categories/recommended
// operations are called again, and assert (a) no skeleton ever mounts
// during the render pass and (b) the mocked transport records zero calls
// for those two operations.
// Verification points / expected results / pass criteria:
//   - Zero invocations of the categories/recommended-products mocked
//     resolvers across the full render + effect-flush cycle.
//   - `CategorySkeletonGrid` / `RecommendedSkeletonGrid` never appear in
//     the DOM at any point (assert via render-count/queryByTestId across
//     synchronous render and after `await waitFor` flush, not just the
//     final settled DOM).
//   - Fail if either skeleton mounts even transiently, or if the mocked
//     transport is called for a query/variable pair already seeded.
