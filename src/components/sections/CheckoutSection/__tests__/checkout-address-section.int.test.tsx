// Checkout Address Section integration Test - Design Doc: checkout-address-section-design.md
// Generated: 2026-07-08 | Budget Used: 3/3 integration, 0/3 fixture-e2e, 0/2 service-e2e
//
// Setup notes (implementer):
// - Render with CheckoutProvider + ApolloProvider (getApolloClient) + MSW server.use overrides
// - Mock useAuth via vi.mock('@/lib/hooks/useAuth') — toggle isAuthenticated per scenario
// - MSW: override graphql.query('Addresses') for empty [], single, or multi-address fixtures
// - Preload Thai address dataset mock if useThaiAddressDataset async gate blocks interactions
// - Use sampleSavedAddress / additional address fixtures from @/test/mocks/fixtures/checkout
// - Mock boundary: GraphQL I/O only (Addresses, CreateAddress, UpdateAddress, DeleteAddress, SetDefaultAddress)
// - Do NOT mock CheckoutAddressSection internals, guestCheckoutValidation, or CheckoutProvider
//
// ---------------------------------------------------------------------------
// Test 1 — Display mode resolution across auth and address query states
// ---------------------------------------------------------------------------
//
// AC1: "When the shopper is unauthenticated, the system shall render การติดต่อ and การจัดส่ง sections under ที่อยู่จัดส่ง" (AC-001)
// AC2: "When the shopper is authenticated and the addresses query returns an empty array, the system shall render inline การจัดส่ง with save checkbox and shall not render การติดต่อ" (AC-002)
// AC3: "When the shopper is authenticated and at least one saved address exists, the system shall render the summary card with เปลี่ยน and shall not render the inline full form by default" (AC-003)
// AC14: "While addresses are loading for authenticated users, the system shall show address-loading skeleton without interactive fields" (AC-038)
//
// ROI: 90 (BV:9 × Freq:9 + Legal:0 + Defect:9)
// Behavior: Vary isAuthenticated + MSW Addresses response → CheckoutAddressSection renders exactly one display mode with correct child sections
// @category: integration
// @lane: integration
// @dependency: CheckoutAddressSection, CheckoutProvider, useAuth (mock), useAddresses (MSW Addresses query)
// @complexity: medium
// Primary failure mode: section renders the wrong mode (e.g., guest sees summary card, auth-empty shows contact section, or loading skeleton replaced by interactive fields mid-flight)
// Proof obligation: traverse four mode boundaries — (a) guest: assert checkout-address-mode-guest, checkout-contact-section + checkout-shipping-section visible, address-summary absent; (b) auth-inline: assert checkout-address-mode-auth-inline, checkout-shipping-section + save-address-checkbox visible, checkout-contact-section absent; (c) auth-summary: assert checkout-address-mode-auth-summary, address-summary + address-change-button visible, inline shipping fields absent; (d) auth-loading: delay Addresses handler, assert address-loading present and no mode-guest/auth-inline/auth-summary content until settled
// Verification points / expected results / pass criteria:
// - Exactly one mode probe testid matches resolveDisplayMode() output per scenario
// - Guest: contact-phone-field and thai-dropdown-province present; address-summary absent
// - Auth-inline: save-address-checkbox present; checkout-contact-section absent
// - Auth-summary: address-summary present; address-list testid absent (deprecated)
// - Auth-loading: address-loading skeleton visible; no address-change-button or shipping inputs interactable
//
// ---------------------------------------------------------------------------
// Test 2 — Inline field validation on failed submit (guest shipping + contact)
// ---------------------------------------------------------------------------
//
// AC5: "When the guest enters an invalid contact phone and submits, the system shall show กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง on contact-phone-field" (AC-006, AC-041)
// AC9: "When the shopper submits with empty sub-district, the system shall block submit and show กรุณาเลือกตำบลของคุณ on the sub-district dropdown" (AC-021)
// AC (inline errors): AC-040 — field-level errors adjacent to invalid inputs after submit attempt
//
// ROI: 89 (BV:10 × Freq:8 + Legal:0 + Defect:9)
// Behavior: Guest mode with invalid contactPhone + empty subDistrict → trigger checkout submit validation → inline Thai errors appear on mapped testids; editing a field clears its error
// @category: core-functionality
// @lane: integration
// @dependency: CheckoutAddressSection, useCheckoutSubmit (or validation wiring), guestCheckoutValidation, fieldErrors/showFieldErrors props
// @complexity: medium
// Primary failure mode: submit shows toast-only feedback without inline errors, or errors bind to wrong testids/keys (guestPhone vs contactPhone, subDistrict missing from GuestCheckoutField)
// Proof obligation: arrange guest form with contactPhone='12345' and subDistrict=''; act on place-order/submit path that invokes validateGuestCheckoutForm and sets fieldErrors + showFieldErrors=true; assert contact-phone-field description/error contains กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง and thai-dropdown-subdistrict shows กรุณาเลือกตำบลของคุณ; act again by correcting contactPhone — assert guestPhone error clears on contact-phone-field while subDistrict error persists until sub-district selected
// Verification points / expected results / pass criteria:
// - Submit does not proceed to createOrder while validation fails
// - contact-phone-field shows Thai invalid-format message (not missing-phone message)
// - thai-dropdown-subdistrict shows SUB_DISTRICT_REQUIRED_MESSAGE
// - showFieldErrors gates visibility — no error descriptions before submit attempt
// - Field edit clears only the edited field's error key (AC-040 partial-clear contract)
//
// ---------------------------------------------------------------------------
// Test 3 — Address management modal selection confirm updates checkout context
// ---------------------------------------------------------------------------
//
// AC10: "When the shopper opens the address modal, the system shall list addresses with default first and disable ยืนยัน until a row is selected" (AC-028, AC-029)
// AC (confirm): AC-034 — ยืนยัน sets selectedAddressId and closes modal
// AC4: "When saved addresses load, the system shall set selectedAddressId to the default address or the first address" (AC-004) — baseline before modal change
//
// ROI: 76 (BV:9 × Freq:7 + Legal:0 + Defect:8)
// Behavior: Auth-summary with ≥2 saved addresses → click เปลี่ยน → modal list → ยืนยัน disabled until row selected → confirm → CheckoutProvider.selectedAddressId updates and modal closes
// @category: integration
// @lane: integration
// @dependency: CheckoutAddressSection, SavedAddressSummaryCard, AddressManagementModal, CheckoutProvider, useAddresses (MSW)
// @complexity: high
// Primary failure mode: ยืนยัน enabled without pending selection, setAddress not called on confirm, or modal stays open after successful confirm
// Proof obligation: MSW returns two addresses (one isDefault, one not); render auth-summary; assert initial selectedAddressId matches default; open address-change-button → address-modal visible with address-option-{id} rows sorted default-first; assert address-confirm-button disabled; click non-default address-option-{id} → confirm enabled; click address-confirm-button → modal unmounted/hidden, selectedAddressId equals chosen id, summary card reflects new selection
// Verification points / expected results / pass criteria:
// - address-modal and address-modal-title (ข้อมูลการจัดส่ง) visible after เปลี่ยน click
// - address-confirm-button disabled when no address-option row selected
// - Default address row shows default-address-badge and appears first in list
// - After confirm: address-modal absent, address-summary reflects selected address name/line
// - CheckoutProvider probe confirms selectedAddressId changed from default to pending selection
//
// ---------------------------------------------------------------------------
// Deferred candidates (below integration budget — implement if budget expanded)
// ---------------------------------------------------------------------------
//
// - Auth-inline submit: createAddress before createOrder with isDefault from checkbox (AC-037) — ROI 76
// - Delete selected address fallback to new default/first (AC-035) — ROI 49
// - Province change clears district, subDistrict, postalCode (AC-015) — ROI 64
// - Auth-error mode shows address-error + blocks submit until retry succeeds — ROI 39
// - Thai cascade auto-fills disabled postalCode on sub-district select (AC-018) — ROI 58
