// Promotion Auto-Apply fixture-e2e Test — Storefront checkout one-shot journey
// Design Doc: promotion-auto-apply-frontend-design.md
// UI Spec: promotion-auto-apply-ui-spec.md (UI-AA-004–007, golden states 3–6)
// PRD: promotion-auto-apply-prd.md (AC-007–009, AC-012, AC-018–023; Rules AA1, AA3, C1)
// ADR: ADR-0008-promotion-auto-apply-checkout.md
// Parent pattern: promotion-universal-conditions.fixture.e2e.test.tsx
// Generated: 2026-07-16 | Budget Used: integration 0/3, fixture-e2e 2/3 (reserved + slot 2),
// service-e2e 0/2
//
// Implement target: promotion-auto-apply.fixture.e2e.test.tsx (RTL+MSW fixture-e2e;
// promote this skeleton when CheckoutAutoApplyController + runCheckoutAutoApply land —
// frontend Design Doc Phase C).
// Feature fixture-e2e budget (3/3 total): this file Journey 1 (reserved) + Journey 2 +
// admin toggle journey in sopet-admin/e2e/promotion-auto-apply.fixture.e2e.skeleton.ts.
//
// Test Boundaries compliance (Frontend Design Doc § Test Boundaries):
// Mock: Apollo validatePromotion / activePlatformPromotions / activeStorePromotions — MSW
// @real-dependency: CheckoutProvider (dual-lane writes + applied UI); sessionStorage once-gate
// Prefetch: stub Apollo client.query per cart storeId inside runner when ungated
//
// Auth / MSW notes (extend checkout fixtures when implementing):
// - Guest or logged-in as needed for eligible candidates (hard gates via validate MSW)
// - MSW active lists must include autoApply + priority on PromotionType fixtures
// - MSW validatePromotion returns discountAmount / ineligibilityReason / freeUnits
//
// ---------------------------------------------------------------------------
// Journey 1 (RESERVED): First /checkout entry → dual-lane auto-apply → existing applied UI
// ---------------------------------------------------------------------------
//
// Journey AC: "Customer enters /checkout with once-gate absent, cart + active lists ready →
// auto-apply fills empty platform + per-store lanes → existing platform card / store row /
// summary show winners without toast/spinner; once-gate set (AC-007, AC-008, AC-012,
// AC-023, UI-AA-004) — S-Checkout entry → settled applied"
// Screen transition: Cart/nav → S-Checkout (gate absent) → S-Checkout (settled applied)
// ROI: 99 (BV:10 × Freq:9 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step)
// Behavior: Mount checkout with CheckoutAutoApplyController + two stores with distinct
// autoApply winners → assert applied-platform-promotion + store “ใช้ส่วนลด … แล้ว” where
// discountAmount>0 + summary discount rows; no auto-apply toast/banner/spinner; sessionStorage
// sopet.checkout.autoApplyAttempted === '1'
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW active*/validatePromotion; CheckoutProvider;
// CheckoutAutoApplyController; CheckoutPromotionSection; CheckoutStoreActionsRow;
// CheckoutSummarySection
// @complexity: high
// Primary failure mode: auto-apply never writes provider; only one lane fills; new toast/
// spinner appears; applied testids absent; gate not set after success; ranking uses estimate
// Primary failure mode (UI): customer cannot tell what applied (FR-8 / AC-023)
// Proof obligation: MSW platform + two store lists with autoApply:true and validate scores;
// gate absent; render checkout tree with controller; wait settle; assert
// data-testid="applied-platform-promotion" shows winner name; each winning store row shows
// success copy when discountAmount>0; summary platform/store discount rows when totals>0;
// queryBy* toast/banner/auto-apply spinner absent; sessionStorage key set to '1'. Boundary:
// confirmation via existing surfaces only (UI-AA-004). Fixture-only GraphQL — no live backend.
// Verification points / expected results / pass criteria:
// - Platform applied card visible with auto-applied name (existing testid)
// - Store A and Store B independently show applied success when winners have amount > 0
// - Summary discount rows / savings update from provider state
// - No new toast, banner, or auto-apply-only loading chrome
// - sopet.checkout.autoApplyAttempted === '1' after settle
//
// ---------------------------------------------------------------------------
// Journey 2: C1 skip + remount gate + soft-fail / zero candidates still gate
// ---------------------------------------------------------------------------
//
// Journey AC: "At attempt start, prefilled lane is skipped (C1); empty lane may fill;
// after settle remount/refresh does not re-run; soft-fail or zero autoApply candidates
// leave lanes empty/unchanged but still set once-gate; manual picker remains usable
// (AC-009, AC-018–022, UI-AA-006, UI-AA-007)"
// ROI: 88 (BV:9 × Freq:8 + Legal:0 + Defect:8)
// Behavior: Pre-seed one lane in CheckoutProvider → run auto-apply → assert skip;
// set gate / remount controller → no second validate storm; MSW empty autoApply or soft
// validate failures → no applied change + gate set; open manual modal still works
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW; real CheckoutProvider prefill; once-gate;
// CheckoutAutoApplyController remount; existing promo modals
// @complexity: high
// Primary failure mode: C1 overwrites user-selected code; remount re-applies after gate;
// soft-fail throws to error boundary or shows auto-apply error toast; zero candidates
// leaves gate unset so refresh loops auto-apply
// Proof obligation: (1) prefill platform or store code before controller attempt → that
// code unchanged while empty sibling lane may fill; (2) after gate set, remount controller
// with empty provider → no new validatePromotion calls / no re-apply; (3) MSW all
// autoApply:false or all validate soft-fail → no applied testids added; gate still '1';
// (4) open store/platform promo modal → picker usable. Boundary: C1 at attempt start
// before validate (UI-AA-006); soft-fail silent (UI-AA-007).
// Verification points / expected results / pass criteria:
// - Prefilled lane code unchanged; empty lane may receive auto-apply winner
// - Remount with gate set → auto-apply does not run (spy validate / no setter churn)
// - Zero eligible / soft-fail → no new applied UI; gate set
// - Manual picker/modal still opens and can apply after soft-fail
// - No auto-apply-specific error toast
