import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE,
  CheckoutSavedAddressToast,
  showCheckoutSavedAddressToast,
} from './CheckoutSavedAddressToast';

vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('CheckoutSavedAddressToast', () => {
  beforeEach(() => {
    vi.mocked(toast.custom).mockClear();
    vi.mocked(toast.dismiss).mockClear();
  });

  it('shows the saved-address copy and closes on dismiss', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<CheckoutSavedAddressToast onClose={onClose} />);

    expect(screen.getByText(CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ปิด' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('opens the banner at the top right', () => {
    showCheckoutSavedAddressToast();

    expect(toast.custom).toHaveBeenCalledOnce();
    const [renderToast, options] = vi.mocked(toast.custom).mock.calls[0];
    expect(options).toMatchObject({
      id: 'checkout-saved-address',
      position: 'top-right',
      duration: 4000,
      unstyled: true,
    });

    render(renderToast('checkout-saved-address'));
    expect(screen.getByText(CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE)).toBeInTheDocument();
  });
});
