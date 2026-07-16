// Promotion List-Time Eligibility fixture-e2e Test — Storefront checkout Decision 6 delta
// Design Doc: promotion-universal-conditions-frontend-design.md (§ Delta list-time)
// UI Spec: promotion-universal-conditions-ui-spec.md (AC-039–AC-051, UI-D-005/006/007)
// PRD: promotion-universal-conditions-prd.md (FR-12 / Rules G–H)
// Generated: 2026-07-17 | Budget Used: integration 0/3, fixture-e2e 3/3, service-e2e 0/2
//
// Delta-named (not appended to promotion-universal-conditions.fixture.e2e.test.tsx):
// Decision 5 fixture-e2e budget already holds guest + BxGy journeys. Comment-only until
// mergeListTimeEligibility + validatePromotions MSW + modal wiring land.
//
// Implement target: promotion-list-time-eligibility.fixture.e2e.test.tsx (RTL+MSW).
// This .skeleton.tsx stays comment-only so Vitest does not load an empty suite.
// MSW: ValidatePromotions batch; Active* catalog-only; useAuth; both Checkout*PromotionModal.
//
// Delta Test Boundaries (Frontend Design Doc):
// Mock: GraphQL validatePromotions / active* via MSW; useAuth
// @real-dependency: none (full-ui mocked backend)
// Assert: NOT_NEW_CUSTOMER list-time; AC-051 banner; exactly one batch on open; apply
// still single validate; store+platform parity
//
// ---------------------------------------------------------------------------
// Journey 1 (RESERVED): List-time hybrid sections + NOT_NEW_CUSTOMER (both modals)
// ---------------------------------------------------------------------------
//
// Journey AC: "Logged-in returning customer opens store then platform promo modal →
// usable under ใช้ได้ตอนนี้ / soft-ineligible under ใช้ไม่ได้ตอนนี้ (Rule G hybrid) →
// new-customer promo shows NOT_NEW_CUSTOMER Thai copy before apply via softReasonOverride
// → unavailable not selectable → exactly one validatePromotions (not N× validatePromotion)
// → confirm still single validatePromotion (AC-039, AC-040, AC-041, AC-042, AC-043,
// AC-046, AC-048 UI half, AC-049, AC-050; UI-D-007)"
// ROI: 99 (BV:10 × Freq:9 + Legal:0 + Defect:9) — reserved slot (user-facing multi-step)
// Behavior: Catalog active* (no eligibility fields) + client-local categorize first paint →
// one ValidatePromotions batch → mergeListTimeEligibility overrides → sections + cards
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW activeStorePromotions / activePlatformPromotions
// (catalog-only AC-047); ValidatePromotions soft items; useAuth logged-in returning;
// CheckoutStorePromotionModal / CheckoutPlatformPromotionModal; softReasonOverride
// @complexity: high
// Primary failure mode: returning customer never sees NOT_NEW_CUSTOMER until apply;
// N× ValidatePromotion on open; unavailable card selectable; batch eligible treated as
// apply grant; store/platform diverge; soft copy missing or color-only
// Proof obligation: MSW catalog returns mix of usable + newCustomer-conditioned +
// min/BxGy soft-ineligible; MSW ValidatePromotions returns ORDER_HISTORY (or ACCOUNT_AGE)
// for conditioned id; spy GraphQL — exactly one ValidatePromotions, zero N-fan-out
// ValidatePromotion on open; assert sections ใช้ได้ตอนนี้ / ใช้ไม่ได้ตอนนี้ membership by
// promotion id (hybrid union); unavailable card warning
// โปรโมชันนี้สำหรับลูกค้าใหม่เท่านั้น (data-testid=unavailable-promotion-warning) and
// non-interactive (no radio / disabled); confirm still fires single ValidatePromotion.
// Repeat assertions on platform modal (AC-050 parity). Boundary: batch override vs
// client-local; Rule H family collapse on softReasonOverride.
// Verification points / expected results / pass criteria:
// - Available then unavailable section order; counts match hybrid membership (AC-039)
// - Conditioned promo in ใช้ไม่ได้ตอนนี้ before apply with NOT_NEW_CUSTOMER copy (AC-041)
// - Minimum Rule H families renderable via fixtures: NOT_NEW_CUSTOMER, GUEST_REQUIRED,
//   MIN_PURCHASE, BXGY_QTY (AC-042) — at least NOT_NEW_CUSTOMER + one other in journey
// - Warning text present (not color-only) (AC-043)
// - Unavailable not selectable (AC-040); lock / reduced interactivity observable (AC-045 info)
// - Exactly one ValidatePromotions on open; no N× ValidatePromotion (AC-046)
// - Active* responses lack eligibility fields as primary (AC-047 contract in fixture)
// - Confirm path still single ValidatePromotion; batch eligible ≠ auto-apply (AC-048)
// - Store + platform modals identical section/card/merge behavior (AC-049/050)
//
// ---------------------------------------------------------------------------
// Journey 2: AC-051 / UI-D-005 batch failure degraded UX (both modals)
// ---------------------------------------------------------------------------
//
// Journey AC: "When validatePromotions fails or times out, then UI-D-005: keep
// catalog+client-local available; retain client-local ใช้ไม่ได้ตอนนี้; show banner
// ไม่สามารถตรวจสอบสิทธิ์โปรโมชันบางรายการได้ในขณะนี้ with aria-live=polite; never unlock;
// never treat as apply success (AC-051, AC-049/050)"
// ROI: 72 (BV:9 × Freq:7 + Legal:0 + Defect:9)
// Behavior: Modal open → MSW GraphQL/network error on ValidatePromotions → softEligibilityError
// banner + client-local unavailable retained
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW ValidatePromotions error/timeout;
// client-local categorize fixtures (guest/min/BxGy unavailable); both modals
// @complexity: medium
// Primary failure mode: unavailable wiped empty; banner missing/wrong copy; locked cards
// unlock; failure treated as apply success; aria-live absent
// Proof obligation: Seed client-local unavailable (e.g. guest or min-purchase); MSW
// ValidatePromotions returns GraphQL/network error; assert banner exact Thai string +
// aria-live="polite"; assert client-local unavailable cards still present and locked;
// available from catalog+client-local still shown; onConfirm not called as success.
// Both modals. Optional Retry re-fires batch only (if implemented).
// Verification points / expected results / pass criteria:
// - Banner text === ไม่สามารถตรวจสอบสิทธิ์โปรโมชันบางรายการได้ในขณะนี้
// - Banner (or live region) has aria-live="polite"
// - Client-local ใช้ไม่ได้ตอนนี้ membership retained (UI-D-005 wins over empty wipe)
// - Cards remain non-selectable / locked; no unlock
// - No apply success side effect from batch failure
// - Store + platform parity
//
// ---------------------------------------------------------------------------
// Journey 3: Available selectable / unapply + confirm authority (AC-044, AC-048)
// ---------------------------------------------------------------------------
//
// Journey AC: "When available cards render and customer selects then confirms, then
// selectable/selected/unapply match Figma information states and confirm still uses
// single validatePromotion — batch eligible never grants apply (AC-044, AC-048)"
// ROI: 64 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Soft-eligible catalog promo in ใช้ได้ตอนนี้ → select radio/selected frame →
// optional ไม่ใช้ส่วนลด → confirm → single ValidatePromotion MSW
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (mocked backend) — MSW ValidatePromotions eligible items;
// ValidatePromotion on confirm; CheckoutStorePromotionModal (platform spot-check optional)
// @complexity: medium
// Primary failure mode: confirm applies from batch alone without ValidatePromotion;
// selected/unapply controls missing; unavailable styled as selectable
// Proof obligation: Batch marks promo eligible; assert available card interactive
// (radio / select); select then ไม่ใช้ส่วนลด clears selection type none; confirm with
// selection fires exactly one ValidatePromotion (not only batch); onConfirm receives
// server validate result. Pixel-perfect Figma is out of scope — assert information
// states (selectable / selected / unapply control present). Boundary: list-time batch
// vs apply-time single validate.
// Verification points / expected results / pass criteria:
// - Available card selectable; selected state observable after click (AC-044 info)
// - ไม่ใช้ส่วนลด / unapply control present and clears discount selection
// - Confirm invokes single ValidatePromotion; batch alone does not call onConfirm success
// - Soft-ineligible cards remain non-selectable in same modal (regression guard)
