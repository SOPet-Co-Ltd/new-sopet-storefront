/**
 * MSW override handlers for Promotion Universal Conditions fixture-e2e.
 * Install via `server.use(...promotionUniversalConditionsHandlers)` in journeys —
 * do not replace default checkout handlers globally.
 */
import { graphql, HttpResponse } from 'msw';
import {
  bxgyStorePromotion,
  fixedAmountClampPromotion,
  guestNewCustomerPlatformPromotion,
  guestNewCustomerStorePromotion,
  validatePromotionBxGyEligible,
  validatePromotionBxGyInsufficientQty,
  validatePromotionGuestRequired,
} from './fixtures/promotion-universal-conditions';

export type ValidatePromotionStubMode = 'bxgy-eligible' | 'bxgy-insufficient' | 'guest-required';

function resolveValidatePromotion(mode: ValidatePromotionStubMode) {
  switch (mode) {
    case 'bxgy-insufficient':
      return validatePromotionBxGyInsufficientQty;
    case 'guest-required':
      return validatePromotionGuestRequired;
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
    graphql.query('ValidatePromotion', () => {
      return HttpResponse.json({
        data: { validatePromotion: resolveValidatePromotion(validateMode) },
      });
    }),
  ];
}

/** Default export: guest journey stubs (most common Phase 2 consumer). */
export const promotionUniversalConditionsHandlers = guestJourneyPromotionHandlers;
