import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckoutMobileBottomBar } from './CheckoutMobileBottomBar';

vi.mock('@/lib/hooks/useCheckoutTotals', () => ({
  useCheckoutTotals: () => ({
    finalPrice: 230.4,
    isShippingComplete: true,
  }),
}));

describe('CheckoutMobileBottomBar', () => {
  it('stays pinned to the viewport bottom on mobile', () => {
    render(<CheckoutMobileBottomBar onSubmit={vi.fn()} isSubmitting={false} canSubmit={true} />);

    const bar = screen.getByTestId('checkout-mobile-bottom-bar');
    expect(bar.className).toMatch(/fixed/);
    expect(bar.className).toMatch(/inset-x-0/);
    expect(bar.className).toMatch(/bottom-0/);
  });
});
