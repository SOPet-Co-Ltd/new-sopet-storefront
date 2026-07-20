import { describe, expect, it } from 'vitest';
import {
  hasQrExpiredAt,
  isOrderNotPayableError,
  PAYMENT_ORDER_NOT_PAYABLE_COPY,
} from '@/lib/payment/orderNotPayable';

describe('orderNotPayable', () => {
  it('exposes Thai cancelled copy', () => {
    expect(PAYMENT_ORDER_NOT_PAYABLE_COPY).toContain('หมดเวลาชำระเงิน');
  });

  it('detects past QR expiry', () => {
    expect(hasQrExpiredAt('2020-01-01T00:00:00.000Z', Date.parse('2026-07-20T00:00:00.000Z'))).toBe(
      true,
    );
    expect(hasQrExpiredAt('2030-01-01T00:00:00.000Z', Date.parse('2026-07-20T00:00:00.000Z'))).toBe(
      false,
    );
    expect(hasQrExpiredAt(null)).toBe(false);
  });

  it('detects ORDER_NOT_PAYABLE from error messages', () => {
    expect(isOrderNotPayableError(new Error('This order is no longer awaiting payment'))).toBe(
      true,
    );
    expect(isOrderNotPayableError(new Error('ORDER_NOT_PAYABLE'))).toBe(true);
    expect(isOrderNotPayableError(new Error('create payment failed'))).toBe(false);
  });
});
