import { renderHook, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  buildValidatePromotionsInput,
  MAX_VALIDATE_PROMOTIONS_TARGETS,
  useValidatePromotions,
} from '@/lib/hooks/useValidatePromotions';
import { server } from '@/test/mocks/server';
import { CHECKOUT_STORE_ID } from '@/test/mocks/fixtures/checkout';
import {
  bxgyCartLines,
  bxgyStorePromotion,
  fixedAmountClampPromotion,
  validatePromotionsBatchOrderHistorySoft,
  validatePromotionsBatchSuccess,
} from '@/test/mocks/fixtures/promotion-universal-conditions';
import {
  createValidatePromotionsHandlers,
  validatePromotionsTransportErrorHandlers,
} from '@/test/mocks/promotion-universal-conditions.handlers';

const createWrapper = createApolloTestWrapper;

describe('buildValidatePromotionsInput', () => {
  it('builds store batch input with id+code targets, storeId, and mapped lines', () => {
    const input = buildValidatePromotionsInput({
      promotions: [bxgyStorePromotion, fixedAmountClampPromotion],
      subtotal: 800,
      storeId: CHECKOUT_STORE_ID,
      lines: [...bxgyCartLines],
    });

    expect(input.promotions).toEqual([
      { id: bxgyStorePromotion.id, code: bxgyStorePromotion.code },
      { id: fixedAmountClampPromotion.id, code: fixedAmountClampPromotion.code },
    ]);
    expect(input.subtotal).toBe(800);
    expect(input.storeId).toBe(CHECKOUT_STORE_ID);
    expect(input.lines).toHaveLength(2);
    expect(input.lines?.[0]).toMatchObject({
      productId: bxgyCartLines[0].productId,
      quantity: bxgyCartLines[0].quantity,
      unitPrice: bxgyCartLines[0].unitPrice,
      storeId: CHECKOUT_STORE_ID,
    });
  });

  it('omits storeId for platform cart context', () => {
    const input = buildValidatePromotionsInput({
      promotions: [{ id: 'p1', code: 'PLAT10' }],
      subtotal: 400,
      storeId: null,
      lines: [{ productId: 'prod-a', quantity: 1, unitPrice: 400 }],
    });

    expect(input.storeId).toBeUndefined();
    expect(input.promotions).toEqual([{ id: 'p1', code: 'PLAT10' }]);
    expect(input.lines?.[0]).toMatchObject({
      productId: 'prod-a',
      quantity: 1,
      unitPrice: 400,
    });
  });

  it('caps promotions at MAX_VALIDATE_PROMOTIONS_TARGETS (AC-046 batch shape)', () => {
    const promotions = Array.from({ length: MAX_VALIDATE_PROMOTIONS_TARGETS + 5 }, (_, i) => ({
      id: `promo-${i}`,
      code: `CODE${i}`,
    }));

    const input = buildValidatePromotionsInput({
      promotions,
      subtotal: 100,
    });

    expect(input.promotions).toHaveLength(MAX_VALIDATE_PROMOTIONS_TARGETS);
    expect(MAX_VALIDATE_PROMOTIONS_TARGETS).toBe(20);
  });

  it('skips rows lacking both id and code', () => {
    const input = buildValidatePromotionsInput({
      promotions: [
        { id: null, code: '  ' },
        { id: 'keep', code: 'KEEP' },
      ],
      subtotal: 10,
    });

    expect(input.promotions).toEqual([{ id: 'keep', code: 'KEEP' }]);
  });
});

describe('useValidatePromotions', () => {
  it('fires one ValidatePromotions batch and returns items aligned with stub length', async () => {
    let requestCount = 0;

    server.use(
      graphql.query('ValidatePromotions', ({ variables }) => {
        requestCount += 1;
        expect(variables).toMatchObject({
          input: {
            subtotal: 800,
            storeId: CHECKOUT_STORE_ID,
            promotions: [
              { id: bxgyStorePromotion.id, code: bxgyStorePromotion.code },
              { id: fixedAmountClampPromotion.id, code: fixedAmountClampPromotion.code },
            ],
          },
        });
        return HttpResponse.json({
          data: { validatePromotions: validatePromotionsBatchSuccess },
        });
      }),
    );

    const { result } = renderHook(() => useValidatePromotions(), {
      wrapper: createWrapper(),
    });

    const input = buildValidatePromotionsInput({
      promotions: [bxgyStorePromotion, fixedAmountClampPromotion],
      subtotal: 800,
      storeId: CHECKOUT_STORE_ID,
      lines: [...bxgyCartLines],
    });

    const payload = await result.current.validatePromotions(input);

    expect(requestCount).toBe(1);
    expect(payload?.items).toHaveLength(validatePromotionsBatchSuccess.items.length);
    expect(payload?.items[0]?.eligible).toBe(true);

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });
  });

  it('returns ORDER_HISTORY soft item via MSW order-history handlers', async () => {
    server.use(...createValidatePromotionsHandlers('order-history'));

    const { result } = renderHook(() => useValidatePromotions(), {
      wrapper: createWrapper(),
    });

    const payload = await result.current.validatePromotions(
      buildValidatePromotionsInput({
        promotions: validatePromotionsBatchOrderHistorySoft.items,
        subtotal: 500,
      }),
    );

    expect(payload?.items).toHaveLength(2);
    expect(payload?.items[1]?.eligible).toBe(false);
    expect(payload?.items[1]?.ineligibilityReason).toBe('ORDER_HISTORY');
  });

  it('surfaces transport/GraphQL error without inventing eligible items', async () => {
    server.use(...validatePromotionsTransportErrorHandlers);

    const { result } = renderHook(() => useValidatePromotions(), {
      wrapper: createWrapper(),
    });

    const payload = await result.current.validatePromotions(
      buildValidatePromotionsInput({
        promotions: [{ id: 'x', code: 'X' }],
        subtotal: 100,
      }),
    );

    expect(payload).toBeUndefined();
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    expect(result.current.items).toEqual([]);
  });
});
