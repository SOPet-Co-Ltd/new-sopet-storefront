import { describe, expect, it } from 'vitest';
import { getListTimeAvailablePromotionCount } from '@/lib/hooks/usePromotionListTimeEligibility';
import type { MergedListTimeEligibility } from '@/lib/checkout/storePromotionUtils';

const mergedWithOneAvailable: MergedListTimeEligibility = {
  available: [{ id: 'p1' } as MergedListTimeEligibility['available'][number]],
  unavailable: [],
  softEligibilityError: false,
};

describe('getListTimeAvailablePromotionCount', () => {
  it('returns 0 while batch is idle or loading (banner matches modal skeleton)', () => {
    expect(getListTimeAvailablePromotionCount(mergedWithOneAvailable, 'idle')).toBe(0);
    expect(getListTimeAvailablePromotionCount(mergedWithOneAvailable, 'loading')).toBe(0);
  });

  it('returns merged available length after batch success or error', () => {
    expect(getListTimeAvailablePromotionCount(mergedWithOneAvailable, 'success')).toBe(1);
    expect(getListTimeAvailablePromotionCount({ ...mergedWithOneAvailable, available: [] }, 'success')).toBe(
      0,
    );
    expect(getListTimeAvailablePromotionCount(mergedWithOneAvailable, 'error')).toBe(1);
  });
});
