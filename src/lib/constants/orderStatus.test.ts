import { describe, expect, it } from 'vitest';
import {
  CANONICAL_ORDER_STATUS_KEYS,
  ORDER_STATUS_BADGE_VARIANTS,
  ORDER_STATUS_LABELS,
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
  isPendingPaymentStatus,
  isReturnEligibleOrderStatus,
} from './orderStatus';

describe('ORDER_STATUS_LABELS', () => {
  it('maps pending_payment and legacy pending to the same Thai label', () => {
    expect(ORDER_STATUS_LABELS.pending_payment).toBe('รอชำระเงิน');
    expect(ORDER_STATUS_LABELS.pending).toBe('รอชำระเงิน');
  });

  it('maps on_hold to provisional Thai hold label', () => {
    expect(ORDER_STATUS_LABELS.on_hold).toBe('พักการดำเนินการ');
  });

  it('defines labels for all canonical status keys', () => {
    for (const key of CANONICAL_ORDER_STATUS_KEYS) {
      expect(ORDER_STATUS_LABELS[key]).toBeTruthy();
    }
  });
});

describe('getOrderStatusLabel', () => {
  it('returns รอตรวจสอบการโอนเงิน for unpaid bank_transfer orders', () => {
    expect(getOrderStatusLabel('pending_payment', 'bank_transfer')).toBe('รอตรวจสอบการโอนเงิน');
    expect(getOrderStatusLabel('pending', 'bank_transfer')).toBe('รอตรวจสอบการโอนเงิน');
  });

  it('keeps standard pending label for other payment methods', () => {
    expect(getOrderStatusLabel('pending_payment', 'promptpay')).toBe('รอชำระเงิน');
    expect(getOrderStatusLabel('pending_payment', 'credit_card')).toBe('รอชำระเงิน');
    expect(getOrderStatusLabel('pending_payment')).toBe('รอชำระเงิน');
    expect(getOrderStatusLabel('pending_payment', null)).toBe('รอชำระเงิน');
  });

  it('does not override non-pending statuses for bank_transfer', () => {
    expect(getOrderStatusLabel('paid', 'bank_transfer')).toBe('ชำระเงินแล้ว');
    expect(getOrderStatusLabel('cancelled', 'bank_transfer')).toBe('ยกเลิก');
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

  it('uses warning variant for on_hold', () => {
    expect(ORDER_STATUS_BADGE_VARIANTS.on_hold).toBe('warning');
    expect(getOrderStatusBadgeVariant('on_hold')).toBe('warning');
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
    expect(isPendingPaymentStatus('on_hold')).toBe(false);
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
    expect(isReturnEligibleOrderStatus('on_hold')).toBe(false);
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
