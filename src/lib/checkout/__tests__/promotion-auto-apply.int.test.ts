// Promotion Auto-Apply integration Test — Storefront ranking / once-gate / C1 orchestration
// Design Doc: promotion-auto-apply-frontend-design.md
// UI Spec: promotion-auto-apply-ui-spec.md
// PRD: promotion-auto-apply-prd.md (AC-008–012, AC-014–017, AC-020–022; Rules AA2, AA3, C1, C2)
// ADR: ADR-0008-promotion-auto-apply-checkout.md
// Promoted from: promotion-auto-apply.int.skeleton.ts (cases 1–3)
//
// Test Boundaries compliance (Frontend Design Doc § Test Boundaries):
// Mock: Apollo validatePromotion / active* via injectable fn (cases 1–2); injectable
// fetchStorePromotions for case 3 (real CheckoutProvider dual-lane writes)
// @real-dependency: sessionStorage (case 2 — real API; stub throw for Map fallback);
// CheckoutProvider (case 3 — real provider for dual-lane writes)
// Ranking helper / once-gate util: real pure modules

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, waitFor } from '@testing-library/react';
import { createElement, useEffect, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasAutoApplyAttempted,
  markAutoApplyAttempted,
  resetAutoApplyOnceGateMemory,
} from '@/lib/checkout/autoApplyOnceGate';
import {
  rankAutoApplyPromotions,
  type AutoApplyCandidate,
  type ScoredAutoApplyCandidate,
} from '@/lib/checkout/rankAutoApplyPromotions';
import { runCheckoutAutoApply } from '@/lib/checkout/runCheckoutAutoApply';
import * as storePromotionUtils from '@/lib/checkout/storePromotionUtils';
import { SoftPromotionIneligibilityError } from '@/lib/checkout/validateCheckoutPromotion';
import type { PromotionValidation } from '@/lib/hooks/useCheckout';
import {
  CheckoutProvider,
  useCheckout,
  type CheckoutContextValue,
} from '@/lib/providers/CheckoutProvider';
import { samplePromotionValidation } from '@/test/mocks/fixtures/checkout';

const AUTO_APPLY_ATTEMPTED_KEY = 'sopet.checkout.autoApplyAttempted';

type ValidateFn = (candidate: AutoApplyCandidate) => Promise<PromotionValidation>;

/**
 * Int-local score+rank pipeline (Design Doc Ranking Algorithm steps 1–4).
 * Exercises the same boundary as production: injectable validate → soft/hard
 * skip → pure ranker (production orchestration is Integration 3 + runner unit).
 */
async function scoreAndRankLane(
  candidates: AutoApplyCandidate[],
  validate: ValidateFn,
): Promise<ScoredAutoApplyCandidate[]> {
  const eligible = candidates.filter((c) => c.autoApply === true);
  const scored: ScoredAutoApplyCandidate[] = [];

  for (const candidate of eligible) {
    try {
      const validation = await validate(candidate);
      scored.push({
        ...candidate,
        discountAmount: validation.discountAmount,
        validation,
      });
    } catch (error) {
      if (error instanceof SoftPromotionIneligibilityError || error instanceof Error) {
        continue;
      }
      throw error;
    }
  }

  return rankAutoApplyPromotions(scored);
}

function candidate(
  partial: Omit<AutoApplyCandidate, 'autoApply'> & { autoApply?: boolean },
): AutoApplyCandidate {
  return {
    autoApply: partial.autoApply ?? true,
    id: partial.id,
    code: partial.code,
    priority: partial.priority,
    name: partial.name,
    type: partial.type,
  };
}

function validation(discountAmount: number, code = 'X'): PromotionValidation {
  return {
    ...samplePromotionValidation,
    code,
    discountAmount,
  };
}

function stubThrowingSessionStorage(): void {
  const throwingStorage = {
    getItem: () => {
      throw new Error('sessionStorage unavailable');
    },
    setItem: () => {
      throw new Error('sessionStorage unavailable');
    },
    removeItem: () => {
      throw new Error('sessionStorage unavailable');
    },
    clear: () => {
      throw new Error('sessionStorage unavailable');
    },
    key: () => {
      throw new Error('sessionStorage unavailable');
    },
    get length() {
      throw new Error('sessionStorage unavailable');
    },
  } as unknown as Storage;

  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    writable: true,
    value: throwingStorage,
  });
}

describe('promotion-auto-apply integration', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      writable: true,
      value: originalSessionStorage,
    });
    originalSessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      writable: true,
      value: originalSessionStorage,
    });
    originalSessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  // ---------------------------------------------------------------------------
  // Integration 1 of 3 — AA2 ranking + C2 shipping + soft-skip + non-candidate filter
  // ---------------------------------------------------------------------------
  describe('Integration 1 — ranking + soft-skip + non-candidate filter', () => {
    it('ranks by validate discountAmount with AA2 tie-break; never calls estimate (AC-010–011, AC-017, AC-021)', async () => {
      const estimateSpy = vi.spyOn(storePromotionUtils, 'estimatePromotionDiscount');

      const candidates: AutoApplyCandidate[] = [
        candidate({ id: 'a', code: 'LOW', priority: 0 }),
        candidate({ id: 'b', code: 'HIGH', priority: 0 }),
        candidate({ id: 'c', code: 'OFF', priority: 99, autoApply: false }),
        // Intentionally omit autoApply to prove missing flag is excluded
        {
          id: 'd',
          code: 'MISSING',
          priority: 50,
        } as AutoApplyCandidate,
      ];

      const discountByCode: Record<string, number> = {
        LOW: 30,
        HIGH: 50,
        OFF: 100,
        MISSING: 90,
      };

      const validate = vi.fn<ValidateFn>(async (c) =>
        validation(discountByCode[c.code] ?? 0, c.code),
      );

      const ranked = await scoreAndRankLane(candidates, validate);

      // (A) positive 50 vs 30 → 50 wins; (G) autoApply false/missing never scored
      expect(ranked.map((c) => c.code)).toEqual(['HIGH', 'LOW']);
      expect(validate.mock.calls.map(([c]) => c.code).sort()).toEqual(['HIGH', 'LOW']);
      expect(estimateSpy).not.toHaveBeenCalled();

      const rankSource = readFileSync(
        resolve(process.cwd(), 'src/lib/checkout/rankAutoApplyPromotions.ts'),
        'utf8',
      );
      expect(rankSource).not.toMatch(/\bestimatePromotionDiscount\b/);

      const fragmentSource = readFileSync(
        resolve(process.cwd(), 'src/lib/graphql/operations/promotions.graphql'),
        'utf8',
      );
      expect(fragmentSource).toMatch(/\bautoApply\b/);
      expect(fragmentSource).toMatch(/\bpriority\b/);
    });

    it('breaks equal discountAmount with priority DESC then code/id ASC (AC-011)', async () => {
      const candidates = [
        candidate({ id: '2', code: 'BETA', priority: 1 }),
        candidate({ id: '1', code: 'ALPHA', priority: 1 }),
        candidate({ id: '0', code: 'ALPHA', priority: 1 }),
        candidate({ id: 'hi', code: 'PRIO', priority: 5 }),
      ];

      const validate: ValidateFn = async (c) => {
        if (c.code === 'PRIO') return validation(40, c.code);
        return validation(40, c.code);
      };

      const ranked = await scoreAndRankLane(candidates, validate);

      // (B) equal discount → higher priority; (C) equal discount+priority → lower lex code then id
      expect(ranked.map((c) => `${c.code}:${c.id}`)).toEqual([
        'PRIO:hi',
        'ALPHA:0',
        'ALPHA:1',
        'BETA:2',
      ]);
    });

    it('lets positive discount beat shipping scored 0; still picks among only-shipping zeros (AC-017 / C2)', async () => {
      const mixed = await scoreAndRankLane(
        [
          candidate({
            id: 'ship',
            code: 'FREESHIP',
            priority: 99,
            type: 'fixed_shipping_discount',
          }),
          candidate({
            id: 'pct',
            code: 'SAVE10',
            priority: 0,
            type: 'percentage',
          }),
        ],
        async (c) => validation(c.type?.includes('shipping') ? 0 : 25, c.code),
      );

      // (D) shipping scored 0 vs positive → positive wins
      expect(mixed[0]?.code).toBe('SAVE10');
      expect(mixed[1]?.code).toBe('FREESHIP');

      const onlyShipping = await scoreAndRankLane(
        [
          candidate({
            id: 'b',
            code: 'SHIPB',
            priority: 1,
            type: 'percentage_shipping_discount',
          }),
          candidate({
            id: 'a',
            code: 'SHIPA',
            priority: 1,
            type: 'fixed_shipping_discount',
          }),
        ],
        async () => validation(0),
      );

      // (E) only shipping 0s → tie-break still picks one
      expect(onlyShipping).toHaveLength(2);
      expect(onlyShipping[0]?.code).toBe('SHIPA');
    });

    it('soft SoftPromotionIneligibilityError and hard validate throw skip without aborting lane (AC-014–016)', async () => {
      const softValidation = validation(0, 'SOFT');
      const candidates = [
        candidate({ id: 'soft', code: 'SOFT', priority: 0 }),
        candidate({ id: 'hard', code: 'HARD', priority: 0 }),
        candidate({ id: 'ok', code: 'OK', priority: 0 }),
      ];

      const validate: ValidateFn = async (c) => {
        if (c.code === 'SOFT') {
          throw new SoftPromotionIneligibilityError(
            'ไม่ครบจำนวนขั้นต่ำ',
            'BXGY_QTY',
            'INSUFFICIENT_QTY',
            softValidation,
          );
        }
        if (c.code === 'HARD') {
          throw new Error('network failure');
        }
        return validation(40, c.code);
      };

      // (F) soft/hard skip that candidate; remaining successes still ranked
      await expect(scoreAndRankLane(candidates, validate)).resolves.toEqual([
        expect.objectContaining({ code: 'OK', discountAmount: 40 }),
      ]);
    });
  });

  // ---------------------------------------------------------------------------
  // Integration 2 of 3 — Once-gate sessionStorage + in-memory Map fallback
  // ---------------------------------------------------------------------------
  describe('Integration 2 — once-gate sessionStorage + Map fallback', () => {
    it('mark writes sentinel key/value; has* mirrors storage; clear resets (AC-008–009)', () => {
      expect(hasAutoApplyAttempted()).toBe(false);

      markAutoApplyAttempted();

      expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe('1');
      expect(hasAutoApplyAttempted()).toBe(true);
      expect(sessionStorage.length).toBe(1);

      sessionStorage.clear();
      expect(hasAutoApplyAttempted()).toBe(false);
    });

    it('falls back to SPA Map when sessionStorage throws; reset clears Map seam', () => {
      stubThrowingSessionStorage();

      expect(() => markAutoApplyAttempted()).not.toThrow();
      expect(hasAutoApplyAttempted()).toBe(true);

      resetAutoApplyOnceGateMemory();
      expect(hasAutoApplyAttempted()).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Integration 3 of 3 — C1 empty-lane snapshot + dual-lane write into CheckoutProvider
  // ---------------------------------------------------------------------------
  describe('Integration 3 — C1 + dual-lane CheckoutProvider + prefetch', () => {
    function CheckoutStateProbe({
      onContext,
    }: {
      onContext: (context: CheckoutContextValue) => void;
    }) {
      const context = useCheckout();
      useEffect(() => {
        onContext(context);
      }, [context, onContext]);
      return null;
    }

    function renderWithCheckout(onContext: (context: CheckoutContextValue) => void): void {
      function Wrapper({ children }: { children: ReactNode }) {
        return createElement(CheckoutProvider, null, children);
      }
      render(createElement(Wrapper, null, createElement(CheckoutStateProbe, { onContext })));
    }

    it('preserves prefilled lanes, fills empty store independently, prefetches all storeIds (AC-012, AC-020)', async () => {
      let checkout: CheckoutContextValue | undefined;
      renderWithCheckout((ctx) => {
        checkout = ctx;
      });

      await waitFor(() => {
        expect(checkout).toBeDefined();
      });

      checkout!.setPromotion('USER_PLAT');
      checkout!.setPromotionName('User platform');
      checkout!.setPromotionDiscount(5);
      checkout!.setStorePromotion('store-a', {
        code: 'USER_STORE_A',
        name: 'User store A',
        discountAmount: 15,
      });

      await waitFor(() => {
        expect(checkout!.promotionCode).toBe('USER_PLAT');
        expect(checkout!.storePromotionsByStoreId['store-a']?.code).toBe('USER_STORE_A');
      });

      const queriedStoreIds: string[] = [];
      const fetchStorePromotions = vi.fn(async (storeId: string) => {
        queriedStoreIds.push(storeId);
        if (storeId === 'store-a') {
          return [
            {
              id: 'sa',
              code: 'AUTO_A',
              name: 'Auto A',
              autoApply: true,
              priority: 1,
              type: 'fixed_amount',
              conditions: null,
            },
          ];
        }
        return [
          {
            id: 'sb',
            code: 'AUTO_B',
            name: 'Auto B',
            autoApply: true,
            priority: 1,
            type: 'fixed_amount',
            conditions: null,
          },
        ];
      });

      const validatePromotion = vi.fn(async (input: { code: string }) =>
        validation(40, input.code),
      );

      const result = await runCheckoutAutoApply({
        promotionCode: checkout!.promotionCode,
        storePromotionsByStoreId: checkout!.storePromotionsByStoreId,
        storeIds: ['store-a', 'store-b'],
        platformSubtotal: 500,
        storeSubtotals: { 'store-a': 200, 'store-b': 300 },
        platformPromotions: [
          {
            id: 'p',
            code: 'AUTO_PLAT',
            name: 'Auto platform',
            autoApply: true,
            priority: 1,
            type: 'fixed_amount',
            conditions: null,
          },
        ],
        fetchStorePromotions,
        validatePromotion,
        setPromotion: checkout!.setPromotion,
        setPromotionName: checkout!.setPromotionName,
        setPromotionDiscount: checkout!.setPromotionDiscount,
        setPromotionFreeUnits: checkout!.setPromotionFreeUnits,
        setPromotionProductId: checkout!.setPromotionProductId,
        setStorePromotion: checkout!.setStorePromotion,
      });

      expect(result.settled).toBe(true);
      expect(queriedStoreIds.sort()).toEqual(['store-a', 'store-b']);
      expect(fetchStorePromotions).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        // C1: prefilled unchanged
        expect(checkout!.promotionCode).toBe('USER_PLAT');
        expect(checkout!.promotionDiscount).toBe(5);
        expect(checkout!.storePromotionsByStoreId['store-a']?.code).toBe('USER_STORE_A');
        // Empty store-b filled independently
        expect(checkout!.storePromotionsByStoreId['store-b']?.code).toBe('AUTO_B');
        expect(checkout!.storePromotionsByStoreId['store-b']?.discountAmount).toBe(40);
      });

      // Prefilled platform/store-a candidates must not be validated for overwrite
      const validatedCodes = validatePromotion.mock.calls.map((c) => c[0].code);
      expect(validatedCodes).not.toContain('AUTO_PLAT');
      expect(validatedCodes).not.toContain('AUTO_A');
      expect(validatedCodes).toContain('AUTO_B');
    });

    it('chooses Store A and Store B winners independently when both lanes empty (AC-012)', async () => {
      let checkout: CheckoutContextValue | undefined;
      renderWithCheckout((ctx) => {
        checkout = ctx;
      });

      await waitFor(() => {
        expect(checkout).toBeDefined();
      });

      const queriedStoreIds: string[] = [];
      const fetchStorePromotions = vi.fn(async (storeId: string) => {
        queriedStoreIds.push(storeId);
        if (storeId === 'store-a') {
          return [
            {
              id: 'sa',
              code: 'AUTO_A',
              name: 'Auto A',
              autoApply: true,
              priority: 1,
              type: 'fixed_amount',
              conditions: null,
            },
          ];
        }
        return [
          {
            id: 'sb',
            code: 'AUTO_B',
            name: 'Auto B',
            autoApply: true,
            priority: 1,
            type: 'fixed_amount',
            conditions: null,
          },
        ];
      });

      const validatePromotion = vi.fn(async (input: { code: string }) => {
        if (input.code === 'AUTO_A') return validation(30, 'AUTO_A');
        if (input.code === 'AUTO_B') return validation(40, 'AUTO_B');
        return validation(50, input.code);
      });

      const result = await runCheckoutAutoApply({
        promotionCode: checkout!.promotionCode,
        storePromotionsByStoreId: checkout!.storePromotionsByStoreId,
        storeIds: ['store-a', 'store-b'],
        platformSubtotal: 500,
        storeSubtotals: { 'store-a': 200, 'store-b': 300 },
        platformPromotions: [
          {
            id: 'p',
            code: 'AUTO_PLAT',
            name: 'Auto platform',
            autoApply: true,
            priority: 1,
            type: 'fixed_amount',
            conditions: null,
          },
        ],
        fetchStorePromotions,
        validatePromotion,
        setPromotion: checkout!.setPromotion,
        setPromotionName: checkout!.setPromotionName,
        setPromotionDiscount: checkout!.setPromotionDiscount,
        setPromotionFreeUnits: checkout!.setPromotionFreeUnits,
        setPromotionProductId: checkout!.setPromotionProductId,
        setStorePromotion: checkout!.setStorePromotion,
      });

      expect(result.settled).toBe(true);
      expect(queriedStoreIds.sort()).toEqual(['store-a', 'store-b']);
      expect(fetchStorePromotions).toHaveBeenCalledTimes(2);

      await waitFor(() => {
        expect(checkout!.promotionCode).toBe('AUTO_PLAT');
        expect(checkout!.storePromotionsByStoreId['store-a']?.code).toBe('AUTO_A');
        expect(checkout!.storePromotionsByStoreId['store-a']?.discountAmount).toBe(30);
        expect(checkout!.storePromotionsByStoreId['store-b']?.code).toBe('AUTO_B');
        expect(checkout!.storePromotionsByStoreId['store-b']?.discountAmount).toBe(40);
      });

      // AC-012: independent winners — not a shared single code across stores
      expect(checkout!.storePromotionsByStoreId['store-a']?.code).not.toBe(
        checkout!.storePromotionsByStoreId['store-b']?.code,
      );

      const validatedCodes = validatePromotion.mock.calls.map((c) => c[0].code).sort();
      expect(validatedCodes).toEqual(['AUTO_A', 'AUTO_B', 'AUTO_PLAT']);
    });

    it('applies nothing for a lane with zero autoApply candidates (AC-022)', async () => {
      let checkout: CheckoutContextValue | undefined;
      renderWithCheckout((ctx) => {
        checkout = ctx;
      });

      await waitFor(() => {
        expect(checkout).toBeDefined();
      });

      await runCheckoutAutoApply({
        promotionCode: checkout!.promotionCode,
        storePromotionsByStoreId: checkout!.storePromotionsByStoreId,
        storeIds: ['store-a'],
        platformSubtotal: 500,
        storeSubtotals: { 'store-a': 200 },
        platformPromotions: [
          {
            id: 'manual',
            code: 'MANUAL',
            autoApply: false,
            priority: 99,
            type: 'fixed_amount',
            conditions: null,
          },
        ],
        fetchStorePromotions: async () => [
          {
            id: 's',
            code: 'MANUAL_S',
            autoApply: false,
            priority: 1,
            type: 'fixed_amount',
            conditions: null,
          },
        ],
        validatePromotion: vi.fn(async () => validation(100, 'SHOULD_NOT')),
        setPromotion: checkout!.setPromotion,
        setPromotionName: checkout!.setPromotionName,
        setPromotionDiscount: checkout!.setPromotionDiscount,
        setPromotionFreeUnits: checkout!.setPromotionFreeUnits,
        setPromotionProductId: checkout!.setPromotionProductId,
        setStorePromotion: checkout!.setStorePromotion,
      });

      await waitFor(() => {
        expect(checkout!.promotionCode).toBeNull();
        expect(checkout!.storePromotionsByStoreId['store-a']).toBeUndefined();
      });
    });
  });
});
