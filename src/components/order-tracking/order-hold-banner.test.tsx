import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderHoldBanner } from './order-hold-banner';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

describe('OrderHoldBanner', () => {
  it('renders full-hold provisional Thai copy', () => {
    render(<OrderHoldBanner variant="full" />);

    const banner = screen.getByTestId('order-hold-banner');
    expect(banner).toHaveAttribute('data-variant', 'full');
    expect(banner).toHaveAttribute('role', 'status');
    expect(banner).toHaveTextContent(STORE_SUSPENSION_HOLD_COPY.holdBannerFull);
  });

  it('renders mixed-hold provisional Thai copy', () => {
    render(<OrderHoldBanner variant="mixed" />);

    const banner = screen.getByTestId('order-hold-banner');
    expect(banner).toHaveAttribute('data-variant', 'mixed');
    expect(banner).toHaveTextContent(STORE_SUSPENSION_HOLD_COPY.holdBannerMixed);
  });
});
