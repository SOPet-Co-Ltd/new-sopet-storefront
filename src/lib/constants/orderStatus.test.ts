import { describe, expect, it } from 'vitest';
import { CANONICAL_ORDER_STATUS_KEYS, ORDER_STATUS_LABELS } from './orderStatus';

describe('ORDER_STATUS_LABELS', () => {
  it('maps pending_payment and legacy pending to the same Thai label', () => {
    expect(ORDER_STATUS_LABELS.pending_payment).toBe('รอชำระเงิน');
    expect(ORDER_STATUS_LABELS.pending).toBe('รอชำระเงิน');
  });

  it('defines labels for all canonical status keys', () => {
    for (const key of CANONICAL_ORDER_STATUS_KEYS) {
      expect(ORDER_STATUS_LABELS[key]).toBeTruthy();
    }
  });
});
