import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderTrackingSuccessCard } from './order-tracking-success-card';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';
import {
  sampleOrderTrackingFullHold,
  sampleOrderTrackingHeldUnpaid,
  sampleOrderTrackingMixedHold,
} from '@/test/mocks/fixtures/store-suspension-hold';

describe('OrderTrackingSuccessCard hold states', () => {
  it('shows full hold banner, on_hold badge, and hides stepper', () => {
    const order = sampleOrderTrackingFullHold;
    render(<OrderTrackingSuccessCard order={order} status={order.status} items={order.items} />);

    expect(screen.getByText('พักการดำเนินการ')).toBeInTheDocument();
    expect(screen.getByTestId('order-hold-banner')).toHaveAttribute('data-variant', 'full');
    expect(screen.getByTestId('order-hold-banner')).toHaveTextContent(
      STORE_SUSPENSION_HOLD_COPY.holdBannerFull,
    );
    expect(screen.queryByTestId('order-tracking-progress')).not.toBeInTheDocument();
    expect(screen.getByTestId('order-item-hold-chip')).toHaveTextContent('พักจัดส่ง');
  });

  it('shows mixed hold banner and keeps stepper for progressing status', () => {
    const order = sampleOrderTrackingMixedHold;
    render(<OrderTrackingSuccessCard order={order} status={order.status} items={order.items} />);

    expect(screen.getByTestId('order-hold-banner')).toHaveAttribute('data-variant', 'mixed');
    expect(screen.getByTestId('order-hold-banner')).toHaveTextContent(
      STORE_SUSPENSION_HOLD_COPY.holdBannerMixed,
    );
    expect(screen.getByTestId('order-tracking-progress')).toBeInTheDocument();
    expect(screen.getByText('Held Item A')).toBeInTheDocument();
    expect(screen.getByText('Active Item B')).toBeInTheDocument();
  });

  it('shows mixed banner for unpaid sticky with item holds (Decision #15)', () => {
    const order = sampleOrderTrackingHeldUnpaid;
    render(<OrderTrackingSuccessCard order={order} status={order.status} items={order.items} />);

    expect(screen.getByText('รอชำระเงิน')).toBeInTheDocument();
    expect(screen.getByTestId('order-hold-banner')).toHaveAttribute('data-variant', 'mixed');
  });
});
