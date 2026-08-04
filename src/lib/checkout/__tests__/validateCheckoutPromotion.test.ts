import { describe, expect, it, vi } from 'vitest';
import {
  SoftPromotionIneligibilityError,
  extractPromotionErrorCode,
  isCreateOrderHardEligibilityCode,
  validateCheckoutPromotionCode,
} from '@/lib/checkout/validateCheckoutPromotion';
import { mapSoftIneligibilityReason } from '@/lib/checkout/storePromotionUtils';
import { SOFT_REASON_FIXTURE_LABELS } from '@/test/mocks/fixtures/promotion-universal-conditions';

describe('mapSoftIneligibilityReason (validate soft map)', () => {
  it.each([
    ['GUEST', 'GUEST_REQUIRED'],
    ['ORDER_HISTORY', 'NOT_NEW_CUSTOMER'],
    ['ACCOUNT_AGE', 'NOT_NEW_CUSTOMER'],
    ['INSUFFICIENT_QTY', 'BXGY_QTY'],
    ['MISSING_LINES', 'BXGY_QTY'],
    ['SOMETHING_ELSE', 'UNKNOWN'],
  ] as const)('maps %s → %s', (backend, customer) => {
    expect(mapSoftIneligibilityReason(backend)).toBe(customer);
  });
});

describe('validateCheckoutPromotionCode lines + soft UX', () => {
  it('passes cart lines into validatePromotion input', async () => {
    const validatePromotion = vi.fn().mockResolvedValue({
      code: 'BUY2GET1',
      name: 'ซื้อ 2 แถม 1',
      discountAmount: 200,
      ineligibilityReason: null,
      freeUnits: 1,
    });

    const lines = [
      { productId: 'prod-p', quantity: 2, unitPrice: 300, variantId: 'v1' },
      { productId: 'prod-p', quantity: 1, unitPrice: 200, variantId: 'v2' },
    ];

    await validateCheckoutPromotionCode({
      code: 'BUY2GET1',
      subtotal: 800,
      storeId: 'store-1',
      lines,
      validatePromotion,
    });

    expect(validatePromotion).toHaveBeenCalledWith({
      code: 'BUY2GET1',
      subtotal: 800,
      storeId: 'store-1',
      lines: [
        {
          productId: 'prod-p',
          quantity: 2,
          unitPrice: 300,
          variantId: 'v1',
          storeId: 'store-1',
        },
        {
          productId: 'prod-p',
          quantity: 1,
          unitPrice: 200,
          variantId: 'v2',
          storeId: 'store-1',
        },
      ],
    });
  });

  it('throws SoftPromotionIneligibilityError for INSUFFICIENT_QTY (not invalid-code)', async () => {
    const validatePromotion = vi.fn().mockResolvedValue({
      code: 'BUY2GET1',
      name: 'ซื้อ 2 แถม 1',
      discountAmount: 0,
      ineligibilityReason: 'INSUFFICIENT_QTY',
      freeUnits: 0,
    });

    await expect(
      validateCheckoutPromotionCode({
        code: 'BUY2GET1',
        subtotal: 100,
        lines: [{ productId: 'prod-p', quantity: 1, unitPrice: 100 }],
        validatePromotion,
      }),
    ).rejects.toMatchObject({
      name: 'SoftPromotionIneligibilityError',
      customerReason: 'BXGY_QTY',
      message: SOFT_REASON_FIXTURE_LABELS.BXGY_QTY,
    });

    await expect(
      validateCheckoutPromotionCode({
        code: 'BUY2GET1',
        subtotal: 100,
        validatePromotion,
      }),
    ).rejects.not.toMatchObject({ name: 'PromotionValidationError' });
  });

  it('maps GUEST soft reason to GUEST_REQUIRED copy without hard invalid toast class', async () => {
    const validatePromotion = vi.fn().mockResolvedValue({
      code: 'NEWSTORE30',
      name: 'ลูกค้าใหม่',
      discountAmount: 0,
      ineligibilityReason: 'GUEST',
      freeUnits: null,
    });

    try {
      await validateCheckoutPromotionCode({
        code: 'NEWSTORE30',
        subtotal: 500,
        validatePromotion,
      });
      expect.fail('expected soft ineligibility');
    } catch (error) {
      expect(error).toBeInstanceOf(SoftPromotionIneligibilityError);
      expect((error as SoftPromotionIneligibilityError).customerReason).toBe('GUEST_REQUIRED');
      expect((error as SoftPromotionIneligibilityError).message).toBe(
        SOFT_REASON_FIXTURE_LABELS.GUEST_REQUIRED,
      );
    }
  });
});

describe('createOrder Candidate-001 branching helpers', () => {
  it('treats GUEST / ORDER_HISTORY / ACCOUNT_AGE / MISSING_LINES as hard eligibility', () => {
    expect(isCreateOrderHardEligibilityCode('GUEST')).toBe(true);
    expect(isCreateOrderHardEligibilityCode('ORDER_HISTORY')).toBe(true);
    expect(isCreateOrderHardEligibilityCode('ACCOUNT_AGE')).toBe(true);
    expect(isCreateOrderHardEligibilityCode('MISSING_LINES')).toBe(true);
  });

  it('does not treat INSUFFICIENT_QTY as createOrder hard failure', () => {
    expect(isCreateOrderHardEligibilityCode('INSUFFICIENT_QTY')).toBe(false);
  });

  it('extracts GraphQL extension codes from Apollo-shaped errors', () => {
    expect(
      extractPromotionErrorCode({
        graphQLErrors: [{ extensions: { code: 'ORDER_HISTORY' }, message: 'blocked' }],
      }),
    ).toBe('ORDER_HISTORY');
  });
});
