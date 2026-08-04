import { describe, expect, it } from 'vitest';
import { resolveHoldBannerVariant, shouldShowOrderTrackingProgress } from './holdVisibility';

describe('holdVisibility', () => {
  it('resolves full banner when order status is on_hold', () => {
    expect(resolveHoldBannerVariant('on_hold', [{ fulfillmentStatus: 'on_hold' }])).toBe('full');
  });

  it('resolves mixed banner when items are on_hold but order is not', () => {
    expect(
      resolveHoldBannerVariant('processing', [
        { fulfillmentStatus: 'on_hold' },
        { fulfillmentStatus: 'processing' },
      ]),
    ).toBe('mixed');
  });

  it('resolves mixed banner for unpaid sticky with held items (Decision #15)', () => {
    expect(resolveHoldBannerVariant('pending_payment', [{ fulfillmentStatus: 'on_hold' }])).toBe(
      'mixed',
    );
  });

  it('hides progress stepper when order is on_hold', () => {
    expect(shouldShowOrderTrackingProgress('on_hold')).toBe(false);
  });

  it('keeps progress stepper for mixed progressing orders', () => {
    expect(shouldShowOrderTrackingProgress('processing')).toBe(true);
    expect(shouldShowOrderTrackingProgress('paid')).toBe(true);
  });
});
