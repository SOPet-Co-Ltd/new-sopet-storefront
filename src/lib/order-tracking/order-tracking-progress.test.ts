import { describe, expect, it } from 'vitest';
import { getOrderTrackingActiveStep, isTerminalOrderStatus } from './order-tracking-progress';

describe('order-tracking-progress', () => {
  it('maps order statuses to active step index', () => {
    expect(getOrderTrackingActiveStep('paid')).toBe(0);
    expect(getOrderTrackingActiveStep('processing')).toBe(1);
    expect(getOrderTrackingActiveStep('shipped')).toBe(2);
    expect(getOrderTrackingActiveStep('delivered')).toBe(3);
    expect(getOrderTrackingActiveStep('pending_payment')).toBe(-1);
  });

  it('identifies terminal order statuses', () => {
    expect(isTerminalOrderStatus('cancelled')).toBe(true);
    expect(isTerminalOrderStatus('refunded')).toBe(true);
    expect(isTerminalOrderStatus('paid')).toBe(false);
  });
});
