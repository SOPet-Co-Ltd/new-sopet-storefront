import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SoftPromotionIneligibilityError } from '@/lib/checkout/validateCheckoutPromotion';
import {
  runCheckoutAutoApply,
  type AutoApplyListPromotion,
  type RunCheckoutAutoApplyParams,
} from '@/lib/checkout/runCheckoutAutoApply';
import type { PromotionValidation } from '@/lib/hooks/useCheckout';
import { samplePromotionValidation } from '@/test/mocks/fixtures/checkout';
import * as storePromotionUtils from '@/lib/checkout/storePromotionUtils';

function validation(code: string, discountAmount: number): PromotionValidation {
  return {
    ...samplePromotionValidation,
    code,
    name: `${code} name`,
    discountAmount,
    freeUnits: null,
  };
}

function promo(
  partial: Omit<AutoApplyListPromotion, 'autoApply'> & { autoApply?: boolean },
): AutoApplyListPromotion {
  return {
    autoApply: partial.autoApply ?? true,
    id: partial.id,
    code: partial.code,
    name: partial.name ?? partial.code,
    type: partial.type ?? 'fixed_amount',
    priority: partial.priority ?? 0,
    conditions: partial.conditions ?? null,
  };
}

function createSetters() {
  return {
    setPromotion: vi.fn(),
    setPromotionName: vi.fn(),
    setPromotionDiscount: vi.fn(),
    setPromotionFreeUnits: vi.fn(),
    setPromotionProductId: vi.fn(),
    setStorePromotion: vi.fn(),
  };
}

function baseParams(
  overrides: Partial<RunCheckoutAutoApplyParams> & {
    validatePromotion: RunCheckoutAutoApplyParams['validatePromotion'];
  },
): RunCheckoutAutoApplyParams {
  const setters = createSetters();
  return {
    promotionCode: null,
    storePromotionsByStoreId: {},
    storeIds: [],
    platformSubtotal: 500,
    storeSubtotals: {},
    platformPromotions: [],
    setPromotion: setters.setPromotion,
    setPromotionName: setters.setPromotionName,
    setPromotionDiscount: setters.setPromotionDiscount,
    setPromotionFreeUnits: setters.setPromotionFreeUnits,
    setPromotionProductId: setters.setPromotionProductId,
    setStorePromotion: setters.setStorePromotion,
    ...overrides,
  };
}

describe('runCheckoutAutoApply', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('snapshots C1: skips prefilled platform/store lanes; fills empty sibling (AC-020)', async () => {
    const validatePromotion = vi.fn(async (input: { code: string }) => {
      if (input.code === 'KEEP_ME') {
        return validation('KEEP_ME', 999);
      }
      if (input.code === 'PLATFORM_WIN') {
        return validation('PLATFORM_WIN', 50);
      }
      if (input.code === 'STORE_B_WIN') {
        return validation('STORE_B_WIN', 40);
      }
      return validation(input.code, 10);
    });

    const setters = createSetters();
    const fetchStorePromotions = vi.fn(async (storeId: string) => {
      if (storeId === 'store-a') {
        return [promo({ id: 'sa', code: 'STORE_A_NEW', priority: 1 })];
      }
      return [promo({ id: 'sb', code: 'STORE_B_WIN', priority: 1 })];
    });

    const result = await runCheckoutAutoApply(
      baseParams({
        promotionCode: 'KEEP_ME',
        storePromotionsByStoreId: {
          'store-a': {
            code: 'USER_STORE_A',
            name: 'User pick',
            discountAmount: 20,
          },
        },
        storeIds: ['store-a', 'store-b'],
        storeSubtotals: { 'store-a': 200, 'store-b': 300 },
        platformPromotions: [promo({ id: 'p', code: 'PLATFORM_WIN', priority: 1 })],
        fetchStorePromotions,
        validatePromotion,
        ...setters,
      }),
    );

    expect(result.settled).toBe(true);
    expect(setters.setPromotion).not.toHaveBeenCalled();
    expect(setters.setStorePromotion).not.toHaveBeenCalledWith('store-a', expect.anything());
    expect(setters.setStorePromotion).toHaveBeenCalledWith(
      'store-b',
      expect.objectContaining({ code: 'STORE_B_WIN', discountAmount: 40 }),
    );
    // C1: validate must not run for prefilled lanes' candidates that would overwrite
    expect(validatePromotion.mock.calls.map((c) => c[0].code)).not.toContain('KEEP_ME');
    expect(validatePromotion.mock.calls.map((c) => c[0].code)).not.toContain('STORE_A_NEW');
  });

  it('prefetches activeStorePromotions for every cart storeId (prefetch-gap)', async () => {
    const queriedStoreIds: string[] = [];
    const client = {
      query: vi.fn(async ({ variables }: { query: unknown; variables?: { storeId?: string } }) => {
        // Platform prefetch has no storeId; store prefetch must cover all cart stores.
        if (variables?.storeId) {
          queriedStoreIds.push(variables.storeId);
          return { data: { activeStorePromotions: [] } };
        }
        return { data: { activePlatformPromotions: [] } };
      }),
    };

    await runCheckoutAutoApply(
      baseParams({
        storeIds: ['store-a', 'store-b', 'store-c'],
        storeSubtotals: { 'store-a': 1, 'store-b': 1, 'store-c': 1 },
        platformPromotions: [],
        client: client as never,
        validatePromotion: vi.fn(async () => validation('X', 0)),
        ...createSetters(),
      }),
    );

    expect(queriedStoreIds.sort()).toEqual(['store-a', 'store-b', 'store-c']);
    expect(client.query).toHaveBeenCalled();
  });

  it('writes independent dual-lane winners and never calls estimate (AC-012)', async () => {
    const estimateSpy = vi.spyOn(storePromotionUtils, 'estimatePromotionDiscount');
    const setters = createSetters();

    await runCheckoutAutoApply(
      baseParams({
        storeIds: ['store-a', 'store-b'],
        storeSubtotals: { 'store-a': 200, 'store-b': 300 },
        platformPromotions: [
          promo({ id: 'p1', code: 'PLAT_LOW', priority: 0 }),
          promo({ id: 'p2', code: 'PLAT_HIGH', priority: 0 }),
        ],
        fetchStorePromotions: async (storeId) => {
          if (storeId === 'store-a') {
            return [promo({ id: 'a', code: 'STORE_A', priority: 1 })];
          }
          return [promo({ id: 'b', code: 'STORE_B', priority: 1 })];
        },
        validatePromotion: async (input) => {
          const amounts: Record<string, number> = {
            PLAT_LOW: 10,
            PLAT_HIGH: 50,
            STORE_A: 25,
            STORE_B: 35,
          };
          return validation(input.code, amounts[input.code] ?? 0);
        },
        ...setters,
      }),
    );

    expect(setters.setPromotion).toHaveBeenCalledWith('PLAT_HIGH');
    expect(setters.setPromotionDiscount).toHaveBeenCalledWith(50);
    expect(setters.setStorePromotion).toHaveBeenCalledWith(
      'store-a',
      expect.objectContaining({ code: 'STORE_A', discountAmount: 25 }),
    );
    expect(setters.setStorePromotion).toHaveBeenCalledWith(
      'store-b',
      expect.objectContaining({ code: 'STORE_B', discountAmount: 35 }),
    );
    expect(estimateSpy).not.toHaveBeenCalled();
  });

  it('soft-skips validate failures and zero autoApply candidates without throwing', async () => {
    const setters = createSetters();

    const result = await runCheckoutAutoApply(
      baseParams({
        storeIds: ['store-a'],
        storeSubtotals: { 'store-a': 100 },
        platformPromotions: [
          promo({ id: 'soft', code: 'SOFT', priority: 0 }),
          promo({ id: 'ok', code: 'OK', priority: 0 }),
          promo({ id: 'manual', code: 'MANUAL', autoApply: false }),
        ],
        fetchStorePromotions: async () => [promo({ id: 'none', code: 'NONE', autoApply: false })],
        validatePromotion: async (input) => {
          if (input.code === 'SOFT') {
            throw new SoftPromotionIneligibilityError(
              'soft',
              'BXGY_QTY',
              'INSUFFICIENT_QTY',
              validation('SOFT', 0),
            );
          }
          if (input.code === 'MANUAL') {
            return validation('MANUAL', 100);
          }
          return validation(input.code, 40);
        },
        ...setters,
      }),
    );

    expect(result.settled).toBe(true);
    expect(result.appliedPlatformCode).toBe('OK');
    expect(result.appliedStoreCodes).toEqual({});
    expect(setters.setPromotion).toHaveBeenCalledWith('OK');
    expect(setters.setStorePromotion).not.toHaveBeenCalled();
  });

  it('soft-fails a store lane when active list fetch throws', async () => {
    const setters = createSetters();

    await expect(
      runCheckoutAutoApply(
        baseParams({
          storeIds: ['store-a'],
          storeSubtotals: { 'store-a': 100 },
          platformPromotions: [],
          fetchStorePromotions: async () => {
            throw new Error('network');
          },
          validatePromotion: vi.fn(async () => validation('X', 10)),
          ...setters,
        }),
      ),
    ).resolves.toMatchObject({ settled: true, appliedStoreCodes: {} });

    expect(setters.setStorePromotion).not.toHaveBeenCalled();
  });
});
