// Promotion Auto-Apply integration Test — Storefront ranking / once-gate / C1 orchestration
// Design Doc: promotion-auto-apply-frontend-design.md
// UI Spec: promotion-auto-apply-ui-spec.md
// PRD: promotion-auto-apply-prd.md (AC-008–012, AC-014–017, AC-020–022; Rules AA2, AA3, C1, C2)
// ADR: ADR-0008-promotion-auto-apply-checkout.md
// Generated: 2026-07-16 | Budget Used: integration 3/3, fixture-e2e 0/3, service-e2e 0/2
//
// Implement target: promotion-auto-apply.int.test.ts (Vitest in-process; promote this
// skeleton when ranking / once-gate / runCheckoutAutoApply land — Design Doc Phase B–C).
// Feature integration budget (3/3): all cases in this file. Fixture journeys live in
// CheckoutSection/__tests__/promotion-auto-apply.fixture.e2e.skeleton.tsx and
// sopet-admin/e2e/promotion-auto-apply.fixture.e2e.skeleton.ts.
//
// Test Boundaries compliance (Frontend Design Doc § Test Boundaries):
// Mock: Apollo validatePromotion / active* via injectable fn or MSW for case 3 only
// @real-dependency: sessionStorage (case 2 — real API; stub throw for Map fallback);
// CheckoutProvider (case 3 — real provider for dual-lane writes)
// Ranking helper / once-gate util: real pure modules (unit-grade assertions inside int file)
//
// ---------------------------------------------------------------------------
// Integration 1 of 3 — AA2 ranking + C2 shipping + soft-skip + non-candidate filter
// ---------------------------------------------------------------------------
//
// AC-010–AC-011: "When ranking runs with multiple eligible candidates, then highest
// validatePromotion.discountAmount wins; ties → higher priority → lower lex code →
// lower lex id"
// AC-014–AC-016: "If a candidate soft/hard fails validate, then it is skipped and
// ranking continues among remaining successes"
// AC-017 / C2: "When only shipping-type eligibles remain (all discountAmount=0), then
// tie-break selects one; shipping does not beat positive-discount peers"
// AC-021: "When autoApply !== true, then candidate is excluded"
// ROI: 99 (BV:10 × Freq:9 + Legal:0 + Defect:9)
// Behavior: Scored candidates (and/or validate stubs) → rankAutoApplyPromotions /
// score+rank pipeline → single winner per lane with AA2 order; estimatePromotionDiscount
// never consulted
// @category: core-functionality
// @lane: integration
// @dependency: rankAutoApplyPromotions, validateCheckoutPromotionCode (injectable),
// SoftPromotionIneligibilityError
// @complexity: high
// Primary failure mode: ranking uses estimatePromotionDiscount; shipping-type with
// discountAmount=0 beats a positive peer; soft-fail aborts entire lane instead of
// trying next; autoApply:false / missing still enters candidate set; tie-break ignores
// priority or uses DESC code/id
// Proof obligation: feed scored fixtures — (A) positive 50 vs 30 → 50 wins; (B) equal
// discountAmount → higher priority wins; (C) equal discount+priority → lower lex code
// then lower lex id; (D) shipping scored 0 vs positive → positive wins; (E) only
// shipping 0s → tie-break still picks one; (F) soft SoftPromotionIneligibilityError and
// hard validate throw skip that candidate without throwing out of ranker; (G) candidates
// with autoApply !== true never scored/ranked. Boundary: AA2 score = validate
// discountAmount only (Design Doc forbids estimate). Do not mount CheckoutAutoApplyController.
// Verification points / expected results / pass criteria:
// - Winner code equals max discountAmount among successful validates
// - Tie-break order: priority DESC, code ASC, id ASC
// - Shipping discountAmount=0 never outranks positive discountAmount in same lane
// - Soft/hard validate failure → candidate omitted; remaining successes still ranked
// - autoApply false/undefined excluded before validate
// - No call to estimatePromotionDiscount in ranking path (spy or module boundary)
//
// ---------------------------------------------------------------------------
// Integration 2 of 3 — Once-gate sessionStorage + in-memory Map fallback
// ---------------------------------------------------------------------------
//
// AC-008: "When attempt finishes (apply, zero apply, or soft-fail), then
// sopet.checkout.autoApplyAttempted is set"
// AC-009: "When once-gate is set, then refresh/remount does not re-run auto-apply"
// ROI: 80 (BV:9 × Freq:8 + Legal:0 + Defect:8)
// Behavior: markAutoApplyAttempted → hasAutoApplyAttempted true via sessionStorage '1';
// when getItem/setItem throws → memory Map fallback; resetAutoApplyOnceGateMemory clears
// Map for tests
// @category: core-functionality
// @lane: integration
// @dependency: autoApplyOnceGate (hasAutoApplyAttempted, markAutoApplyAttempted,
// resetAutoApplyOnceGateMemory), sessionStorage
// @complexity: medium
// Primary failure mode: gate key wrong / stores PII; mark never called on zero-apply path
// (covered in fixture); Map fallback unused when storage throws → remount re-applies in
// same SPA; reset helper missing so tests leak gate state
// Proof obligation: real sessionStorage — mark → getItem === '1' and has* true; clear
// storage then has* false; stub sessionStorage getItem/setItem to throw → mark still
// makes has* true via Map; after Map mark, has* true without storage; call
// resetAutoApplyOnceGateMemory → has* false. Key must be exactly
// sopet.checkout.autoApplyAttempted; value sentinel '1' only (no codes/amounts/PII).
// Boundary: storage throw → SPA Map; full reload without storage is soft-skip (fixture).
// Verification points / expected results / pass criteria:
// - Key sopet.checkout.autoApplyAttempted; value '1'
// - hasAutoApplyAttempted mirrors storage or Map
// - Storage throw path uses Map; no uncaught throw from mark/has
// - resetAutoApplyOnceGateMemory clears Map seam for Vitest isolation
// - Stored value is sentinel only (no promotion payload)
//
// ---------------------------------------------------------------------------
// Integration 3 of 3 — C1 empty-lane snapshot + dual-lane write into CheckoutProvider
// ---------------------------------------------------------------------------
//
// AC-012: "When Store A and Store B each have candidates, then winners are chosen
// independently"
// AC-020 / C1: "When a lane already has a selection at attempt start, then that lane is
// skipped; empty lanes may fill"
// AC-022: "When no autoApply===true candidates exist, then nothing applies" (lane-level)
// ROI: 95 (BV:10 × Freq:9 + Legal:0 + Defect:8)
// Behavior: runCheckoutAutoApply with mocked lists/validate → snapshot emptiness → write
// only empty platform/store lanes via existing CheckoutProvider setters; prefilled lane
// unchanged
// @category: integration
// @lane: integration
// @dependency: runCheckoutAutoApply, CheckoutProvider setters, mocked active lists +
// validateCheckoutPromotionCode; optional Apollo client.query stub for multi-store prefetch
// @complexity: high
// Primary failure mode: C1 runs after apply and overwrites user selection; platform and
// store A/B share one winner; empty store skipped despite candidates; prefetch only one
// storeId (prefetch-gap regression)
// Proof obligation: real CheckoutProvider; pre-set platform code OR one store code before
// run; MSW/stub activePlatform + activeStore for two storeIds with distinct autoApply
// winners; assert prefilled lane unchanged and empty lane receives winner setters; assert
// store A and store B codes independent; assert client.query (or inject) invoked for every
// cart storeId when ungated. Boundary: C1 snapshot before any validate/apply (UI-AA-006).
// Gate mark may be asserted here or deferred to fixture journey.
// Verification points / expected results / pass criteria:
// - Prefilled platform/store lane code unchanged after run
// - Empty lanes receive ranked winner via setPromotion* / setStorePromotion
// - Store A winner ≠ Store B winner when fixtures differ (AC-012)
// - Prefetch covers all cart storeIds (no modal-open-only gap)
// - Zero autoApply candidates → no setter writes for that lane
