import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CartSuspendedLinesRemovedBanner } from './CartSuspendedLinesRemovedBanner';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

describe('CartSuspendedLinesRemovedBanner', () => {
  it('renders provisional Thai purge banner copy with status role', () => {
    render(<CartSuspendedLinesRemovedBanner />);

    expect(screen.getByRole('status')).toHaveTextContent(
      STORE_SUSPENSION_HOLD_COPY.cartInvalidatedBanner,
    );
  });

  it('dismiss only hides banner and does not restore lines (callback only)', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<CartSuspendedLinesRemovedBanner onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: 'ปิดการแจ้งเตือน' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
