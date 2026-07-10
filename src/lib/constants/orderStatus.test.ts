import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ORDER_STATUS_KEYS,
  ORDER_STATUS_BADGE_VARIANTS,
  ORDER_STATUS_LABELS,
  getOrderStatusBadgeVariant,
  isPendingPaymentStatus,
  isReturnEligibleOrderStatus,
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
});

describe('isPendingPaymentStatus', () => {
  it('returns true for pending_payment and legacy pending', () => {
    expect(isPendingPaymentStatus('pending_payment')).toBe(true);
    expect(isPendingPaymentStatus('pending')).toBe(true);
  });

  it('returns false for other statuses', () => {
    expect(isPendingPaymentStatus('paid')).toBe(false);
    expect(isPendingPaymentStatus('cancelled')).toBe(false);
  });
});

describe('isReturnEligibleOrderStatus', () => {
  it('returns true for shipped and delivered orders', () => {
    expect(isReturnEligibleOrderStatus('shipped')).toBe(true);
    expect(isReturnEligibleOrderStatus('delivered')).toBe(true);
  });

  it('returns false for pre-fulfillment and terminal statuses', () => {
    expect(isReturnEligibleOrderStatus('pending_payment')).toBe(false);
    expect(isReturnEligibleOrderStatus('paid')).toBe(false);
    expect(isReturnEligibleOrderStatus('processing')).toBe(false);
    expect(isReturnEligibleOrderStatus('cancelled')).toBe(false);
    expect(isReturnEligibleOrderStatus('refunded')).toBe(false);
  });
});

describe('getOrderStatusBadgeVariant', () => {
  it('uses error variant for cancelled orders', () => {
    expect(getOrderStatusBadgeVariant('cancelled')).toBe('error');
  });

  it('falls back to default for unknown statuses', () => {
    expect(getOrderStatusBadgeVariant('unknown_status')).toBe('default');
  });
});
