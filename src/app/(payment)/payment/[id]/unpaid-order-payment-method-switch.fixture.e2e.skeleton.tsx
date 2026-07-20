// Unpaid Order Payment Method Switch fixture-e2e Test — Storefront Mid-QR recovery journey
// Design Doc: unpaid-order-payment-method-switch-frontend-design.md
// Backend Design Doc: unpaid-order-payment-method-switch-backend-design.md (createPayment contracts)
// UI Spec: unpaid-order-payment-method-switch-ui-spec.md (v1.1 golden states 1–11)
// PRD: unpaid-order-payment-method-switch-prd.md (AC-002, AC-005, AC-011, AC-016–AC-018, AC-023)
// Parent pattern: payment/[id]/payment-page.test.tsx + OrderPaymentForm.test.tsx WaitReturn cases
// Generated: 2026-07-19 | Budget Used (feature): integration 3/3 (backend), fixture-e2e 3/3 (this file),
// service-e2e 2/2 (backend)
//
// Implement target: unpaid-order-payment-method-switch.fixture.e2e.test.tsx (RTL+MSW fixture-e2e;
// promote this skeleton when Mid-QR CTA lands — frontend Design Doc Implementation Order §3–5).
// Harness: Vitest + RTL + MSW GraphQL (payment query/subscription + createPayment); mock Next router.
//
// Test Boundaries compliance (Frontend Design Doc § Test Boundaries):
// Mock: GraphQL createPayment / payment — MSW (new-id / same-id / ORDER_NOT_PAYABLE)
// Mock: Omise.js tokenize — existing panel test doubles when card path exercised
// Mock: Next router.push — assert navigation target
// @real-dependency: PaymentPage + OrderPaymentForm + PaymentRetryPanel (real UI tree)
// N/A on FE: backend Omise expire/cancel — assert navigation on success only (fail-open invisible)
//
// Dedup / push-down notes:
//   resolveNewPaymentId same-id unit → submitPaymentRetry.test.ts (keep; do not re-assert pure fn)
//   WaitReturn / Failed retry navigate → partially covered in payment-page.test.tsx —
//   Journey 3 here is the Mid-QR-ship regression gate (AC-018) after inline Mid-QR chrome lands
//   Mid-QR collapsed/expand alone without submit → may also land in OrderPaymentForm.test.tsx unit;
//   reserved journey below owns multi-step createPayment navigation
//
// ---------------------------------------------------------------------------
// Journey 1 (RESERVED): Mid-QR CTA → createPayment → navigate new paymentId
// ---------------------------------------------------------------------------
//
// Journey AC: "When the payment page shows pending PromptPay with live qrCodeUrl, customer
// opens เปลี่ยนวิธีชำระเงิน, submits PaymentRetryPanel (PromptPay restart / card / COD), and
// createPayment returns a NEW paymentId (including backend fail-open cancel), then storefront
// clears prior 3DS one-shot key and router.push(/payment/{newId}) — never soft-succeed on same id;
// never thank-you from switch alone" (prd AC-005, AC-011, AC-016, AC-017; UI Spec golden 1–5, 8–9)
// Screen transition: S-Pay-MidQR (collapsed) → S-Pay-MidQR (expanded) → S-Pay-01 /payment/{newId}
// ROI: 100 (BV:10 × Freq:9 + Legal:0 + Defect:10) — reserved slot (user-facing multi-step)
// Behavior: Render PaymentPage with MSW pending+qrCodeUrl; assert CTA below QR collapsed
// (aria-expanded=false, panel absent); click CTA → PaymentRetryPanel mounts, QR still visible;
// submit PromptPay (and at least one of card/COD) with MSW createPayment returning distinct id
// (incl. a fail-open success response — no cancel-only modal); assert createPayment called with
// same orderId; mockPush(`/payment/${newId}`); prior 3DS session key cleared; thank-you not shown
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (PaymentPage + OrderPaymentForm Mid-QR + PaymentRetryPanel), mocked createPayment GraphQL
// @complexity: high
// Primary failure mode: Mid-QR CTA missing; submit no-ops; soft-navigate on same paymentId;
// or blocking cancel-failure modal contrary to fail-open AC-011
// Proof obligation: MSW payment fixture status=pending + qrCodeUrl set + not expired-interim;
// expand CTA; submit method matrix path(s) with NEW id fixture; assert navigation + createPayment
// args; separate assertion path with same-id MSW response → PaymentRetryError / retrySubmitError,
// panel stays expanded, no push (documents D002 risk). Boundary path: PromptPay→PromptPay restart
// must require new id (resolveNewPaymentId). Fail-open: success MSW without cancel side-effect UI.
// While retrySubmitting: submit disabled (AC-023 spot-check).
// Verification points / expected results / pass criteria:
//   - Golden Mid-QR default + expanded (CTA copy, panel heading เลือกวิธีชำระเงินใหม่).
//   - Successful create → navigate new /payment/{id}; QR primary still present pre-navigate.
//   - Same-id response → inline error; no navigation.
//   - No thank-you solely from method switch.
//   - Fail if CTA absent on live QR, soft-resume accepted, or cancel-only blocking modal shown.
//
// ---------------------------------------------------------------------------
// Journey 2 (ROI ≥ 20): Ineligible createPayment → retrySubmitError, stay on page
// ---------------------------------------------------------------------------
//
// AC (Errors / eligibility): "If createPayment fails (network, validation, ineligible
// ORDER_NOT_PAYABLE, or same-id rejection), then the system shall set retrySubmitError via
// existing Thai/PaymentRetryError messaging, keep the panel expanded, and not navigate"
// PRD / UI Spec: AC-002, golden state 11; UI-LOCK-02 server-authoritative (CTA not pre-hidden)
// ROI: 72 (BV:8 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Mid-QR expand + submit → MSW GraphQL error ORDER_NOT_PAYABLE (or mapped Apollo
// error) → retrySubmitError Thai path visible; panel remains; router.push not called; Mid-QR
// CTA was still shown on live pending QR before submit (no client order.status hide)
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: PaymentPage handleRetryPayment error mapping, PaymentRetryPanel, MSW ineligible createPayment
// @complexity: medium
// Primary failure mode: ineligible supersede soft-navigates or invents client hide based on
// order.status; error swallow leaves user without messaging
// Proof obligation: Live Mid-QR fixture (CTA present despite eligibility unknown client-side);
// MSW createPayment returns GraphQL error with ORDER_NOT_PAYABLE code/message; assert alert /
// retrySubmitError text path; assert mockPush not called; panel still in document expanded.
// Boundary path: server-authoritative — do not assert CTA absent from fabricated order.status.
// Verification points / expected results / pass criteria:
//   - CTA available on live pending QR before submit.
//   - After ineligible error: Thai/error messaging visible; no route change.
//   - Fail if navigates away or CTA was client-hidden via order.status.
//
// ---------------------------------------------------------------------------
// Journey 3 (ROI ≥ 20): Preserve Failed + WaitReturn + QR-expired interim unmount
// ---------------------------------------------------------------------------
//
// AC (Preserve): "While this feature ships, PaymentFailedState shall remain always-expanded
// with PaymentRetryPanel; PaymentWaitingAfterReturnState shall keep collapsed CTA → expand →
// panel behavior unchanged"
// AC (Interim): "While QR-expired interim alert is shown, the system shall not mount the Mid-QR CTA"
// PRD: AC-018; UI Spec golden 6–7, 10
// ROI: 80 (BV:8 × Freq:8 + Legal:0 + Defect:8)
// Behavior: (A) failed payment fixture → panel mounted without CTA click; (B) pending+authorizeUri
// after-return → collapsed เปลี่ยนวิธีชำระเงิน → expand mounts panel; (C) pending+qrCodeUrl+expired
// interim → amber interim text; queryByRole CTA Mid-QR absent
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: OrderPaymentForm Failed / WaitReturn / expired-interim branches, PaymentPage
// @complexity: medium
// Primary failure mode: Mid-QR chrome regresses Failed to collapsed-only or WaitReturn loses CTA;
// Mid-QR CTA incorrectly mounts on QR-expired interim
// Proof obligation: Three fixtures in one suite (or parameterized): failed → getByTestId
// payment-retry-panel without clicking เปลี่ยนวิธีชำระเงิน; waiting-after-return → click CTA →
// panel; expired interim (isExpired pending QR path) → no Mid-QR CTA button. Optional: assert
// PaymentRetryPanel heading class includes text-gray-900 (AA) on one host. Prefer extending
// existing payment-page / OrderPaymentForm tests when promoting skeleton if duplication is lower.
// Verification points / expected results / pass criteria:
//   - Failed always-expanded panel retained.
//   - WaitReturn collapsed→expand retained.
//   - Expired interim: Mid-QR CTA not in document.
//   - Fail if any of the three regress when Mid-QR inline chrome ships.
