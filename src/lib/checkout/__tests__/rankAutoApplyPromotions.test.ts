import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  rankAutoApplyPromotions,
  type ScoredAutoApplyCandidate,
} from '@/lib/checkout/rankAutoApplyPromotions';
import { samplePromotionValidation } from '@/test/mocks/fixtures/checkout';

function candidate(
  partial: Omit<ScoredAutoApplyCandidate, 'validation' | 'autoApply'> & {
    autoApply?: boolean;
    validation?: ScoredAutoApplyCandidate['validation'];
  },
): ScoredAutoApplyCandidate {
  const { validation, autoApply = true, ...rest } = partial;
  return {
    autoApply,
    ...rest,
    validation:
      validation ??
      ({
        ...samplePromotionValidation,
        discountAmount: rest.discountAmount,
      } satisfies ScoredAutoApplyCandidate['validation']),
  };
}

describe('rankAutoApplyPromotions', () => {
  it('ranks highest discountAmount first (AC-010)', () => {
    const ranked = rankAutoApplyPromotions([
      candidate({ id: 'a', code: 'LOW', priority: 0, discountAmount: 30 }),
      candidate({ id: 'b', code: 'HIGH', priority: 0, discountAmount: 50 }),
    ]);

    expect(ranked.map((c) => c.code)).toEqual(['HIGH', 'LOW']);
  });

  it('breaks equal discountAmount with higher priority (AC-011)', () => {
    const ranked = rankAutoApplyPromotions([
      candidate({ id: 'a', code: 'A', priority: 1, discountAmount: 40 }),
      candidate({ id: 'b', code: 'B', priority: 5, discountAmount: 40 }),
    ]);

    expect(ranked.map((c) => c.code)).toEqual(['B', 'A']);
  });

  it('breaks equal discount+priority with lower lex code then id (AC-011)', () => {
    const ranked = rankAutoApplyPromotions([
      candidate({ id: '2', code: 'BETA', priority: 1, discountAmount: 40 }),
      candidate({ id: '1', code: 'ALPHA', priority: 1, discountAmount: 40 }),
      candidate({ id: '0', code: 'ALPHA', priority: 1, discountAmount: 40 }),
    ]);

    expect(ranked.map((c) => `${c.code}:${c.id}`)).toEqual(['ALPHA:0', 'ALPHA:1', 'BETA:2']);
  });

  it('lets positive discount beat shipping-type scored 0 (AC-017 / C2)', () => {
    const ranked = rankAutoApplyPromotions([
      candidate({
        id: 'ship',
        code: 'FREESHIP',
        priority: 99,
        discountAmount: 0,
        type: 'fixed_shipping_discount',
      }),
      candidate({
        id: 'pct',
        code: 'SAVE10',
        priority: 0,
        discountAmount: 25,
        type: 'percentage',
      }),
    ]);

    expect(ranked[0]?.code).toBe('SAVE10');
    expect(ranked[1]?.code).toBe('FREESHIP');
  });

  it('still picks a shipping winner via tie-break when all scores are 0 (AC-017)', () => {
    const ranked = rankAutoApplyPromotions([
      candidate({
        id: 'b',
        code: 'SHIPB',
        priority: 1,
        discountAmount: 0,
        type: 'percentage_shipping_discount',
      }),
      candidate({
        id: 'a',
        code: 'SHIPA',
        priority: 1,
        discountAmount: 0,
        type: 'fixed_shipping_discount',
      }),
    ]);

    expect(ranked).toHaveLength(2);
    expect(ranked[0]?.code).toBe('SHIPA');
  });

  it('excludes autoApply !== true and missing autoApply (AC-021)', () => {
    // Intentionally omit autoApply to prove missing flag is excluded
    const missingAutoApply = {
      id: '3',
      code: 'MISSING',
      priority: 50,
      discountAmount: 90,
      validation: {
        ...samplePromotionValidation,
        discountAmount: 90,
      },
    } as unknown as ScoredAutoApplyCandidate;

    const ranked = rankAutoApplyPromotions([
      candidate({ id: '1', code: 'ON', priority: 0, discountAmount: 10 }),
      candidate({ id: '2', code: 'OFF', priority: 99, autoApply: false, discountAmount: 100 }),
      missingAutoApply,
    ]);

    expect(ranked.map((c) => c.code)).toEqual(['ON']);
  });

  it('does not import client estimate helpers for ranking', () => {
    const sourcePath = resolve(process.cwd(), 'src/lib/checkout/rankAutoApplyPromotions.ts');
    const source = readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/from\s+['"]@\/lib\/checkout\/storePromotionUtils['"]/);
    expect(source).not.toMatch(/\bestimatePromotionDiscount\b/);
  });
});
