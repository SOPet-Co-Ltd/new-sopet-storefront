import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ORDER_STATUS_KEYS,
  ORDER_STATUS_BADGE_VARIANTS,
  ORDER_STATUS_LABELS,
  getOrderStatusBadgeVariant,
} from './orderStatus';

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

describe('ORDER_STATUS_BADGE_VARIANTS', () => {
  it('defines badge variants for all canonical status keys', () => {
    for (const key of CANONICAL_ORDER_STATUS_KEYS) {
      expect(ORDER_STATUS_BADGE_VARIANTS[key]).toBeTruthy();
    }
  });

  it('maps legacy pending to the same variant as pending_payment', () => {
    expect(ORDER_STATUS_BADGE_VARIANTS.pending).toBe(ORDER_STATUS_BADGE_VARIANTS.pending_payment);
  });

  it('uses error variant for cancelled orders', () => {
    expect(getOrderStatusBadgeVariant('cancelled')).toBe('error');
  });

  it('falls back to default for unknown statuses', () => {
    expect(getOrderStatusBadgeVariant('unknown_status')).toBe('default');
  });
});
