/**
 * MSW override handlers for Promotion Universal Conditions fixture-e2e.
 * Install via `server.use(...promotionUniversalConditionsHandlers)` in journeys —
 * do not replace default checkout handlers globally.
 *
 * promotion-logged-in-only Journeys 1–2: use
 * `guestLoggedInOnlyJourneyPromotionHandlers` /
 * `loggedInLoggedInOnlyJourneyPromotionHandlers` /
 * `guestBothKeysJourneyPromotionHandlers` (newCustomer-only remains `guestJourneyPromotionHandlers`).
 */
import { graphql, HttpResponse } from 'msw';
import {
  bxgyStorePromotion,
  fixedAmountClampPromotion,
  guestLoggedInOnlyAndNewCustomerPlatformPromotion,
  guestLoggedInOnlyAndNewCustomerStorePromotion,
  guestLoggedInOnlyPlatformPromotion,
  guestLoggedInOnlyStorePromotion,
  guestNewCustomerPlatformPromotion,
  guestNewCustomerStorePromotion,
  validatePromotionBxGyEligible,
  validatePromotionBxGyInsufficientQty,
  validatePromotionGuestRequired,
  validatePromotionLoggedInOnlyGuestRequired,
} from './fixtures/promotion-universal-conditions';

export type ValidatePromotionStubMode =
  'bxgy-eligible' | 'bxgy-insufficient' | 'guest-required' | 'logged-in-only-guest-required';

function resolveValidatePromotion(mode: ValidatePromotionStubMode) {
  switch (mode) {
    case 'bxgy-insufficient':
      return validatePromotionBxGyInsufficientQty;
    case 'guest-required':
      return validatePromotionGuestRequired;
    case 'logged-in-only-guest-required':
      return validatePromotionLoggedInOnlyGuestRequired;
    case 'bxgy-eligible':
    default:
      return validatePromotionBxGyEligible;
  }
}

/** Journey 1: active lists return newCustomer-conditioned promos only. */
export const guestJourneyPromotionHandlers = [
  graphql.query('ActiveStorePromotions', () => {
    return HttpResponse.json({
      data: { activeStorePromotions: [guestNewCustomerStorePromotion] },
    });
  }),
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: { activePlatformPromotions: [guestNewCustomerPlatformPromotion] },
    });
  }),
  graphql.query('ValidatePromotion', () => {
    return HttpResponse.json({
      data: { validatePromotion: validatePromotionGuestRequired },
    });
  }),
];

/**
 * promotion-logged-in-only Journey 1 — guest + loggedInOnly-only active lists
 * (+ soft GUEST validate stub for AC-018/019 map reuse).
 */
export const guestLoggedInOnlyJourneyPromotionHandlers = [
  graphql.query('ActiveStorePromotions', () => {
    return HttpResponse.json({
      data: { activeStorePromotions: [guestLoggedInOnlyStorePromotion] },
    });
  }),
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: { activePlatformPromotions: [guestLoggedInOnlyPlatformPromotion] },
    });
  }),
  graphql.query('ValidatePromotion', () => {
    return HttpResponse.json({
      data: { validatePromotion: validatePromotionLoggedInOnlyGuestRequired },
    });
  }),
];

/**
 * promotion-logged-in-only Journey 1 variant — both keys on (single GUEST_REQUIRED soft copy).
 */
export const guestBothKeysJourneyPromotionHandlers = [
  graphql.query('ActiveStorePromotions', () => {
    return HttpResponse.json({
      data: { activeStorePromotions: [guestLoggedInOnlyAndNewCustomerStorePromotion] },
    });
  }),
  graphql.query('ActivePlatformPromotions', () => {
    return HttpResponse.json({
      data: { activePlatformPromotions: [guestLoggedInOnlyAndNewCustomerPlatformPromotion] },
    });
  }),
  graphql.query('ValidatePromotion', () => {
    return HttpResponse.json({
      data: { validatePromotion: validatePromotionLoggedInOnlyGuestRequired },
    });
  }),
];

/**
 * promotion-logged-in-only Journey 2 — logged-in shopper; only-loggedInOnly available
 * (active lists reuse members-only fixtures; soft GUEST optional via validate mode).
 */
export function createLoggedInOnlyJourneyPromotionHandlers(
  validateMode: ValidatePromotionStubMode = 'bxgy-eligible',
) {
  return [
    graphql.query('ActiveStorePromotions', () => {
      return HttpResponse.json({
        data: { activeStorePromotions: [guestLoggedInOnlyStorePromotion] },
      });
    }),
    graphql.query('ActivePlatformPromotions', () => {
      return HttpResponse.json({
        data: { activePlatformPromotions: [guestLoggedInOnlyPlatformPromotion] },
      });
    }),
    graphql.query('ValidatePromotion', () => {
      return HttpResponse.json({
        data: { validatePromotion: resolveValidatePromotion(validateMode) },
      });
    }),
  ];
}

/** Alias for Journey 2 default install (members-only lists; no soft GUEST). */
export const loggedInLoggedInOnlyJourneyPromotionHandlers =
  createLoggedInOnlyJourneyPromotionHandlers('bxgy-eligible');

/** Journey 2: BxGy + fixed_amount active lists; validatePromotion mode selectable. */
export function createBxGyJourneyPromotionHandlers(
  validateMode: ValidatePromotionStubMode = 'bxgy-eligible',
) {
  return [
    graphql.query('ActiveStorePromotions', () => {
      return HttpResponse.json({
        data: {
          activeStorePromotions: [bxgyStorePromotion, fixedAmountClampPromotion],
        },
      });
    }),
    graphql.query('ActivePlatformPromotions', () => {
      return HttpResponse.json({
        data: { activePlatformPromotions: [] },
      });
    }),
    graphql.query('ValidatePromotion', ({ variables }) => {
      const input = variables?.input as
        | { lines?: Array<{ productId?: string; quantity?: number; unitPrice?: number }> }
        | undefined;
      // Soft/hard stubs still return; lines presence is asserted by journey tests via last request.
      void input?.lines;
      return HttpResponse.json({
        data: { validatePromotion: resolveValidatePromotion(validateMode) },
      });
    }),
  ];
}

/** Default export: guest journey stubs (most common Phase 2 consumer). */
export const promotionUniversalConditionsHandlers = guestJourneyPromotionHandlers;
