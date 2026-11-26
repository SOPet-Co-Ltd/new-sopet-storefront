import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE,
  showCheckoutSavedAddressToast,
} from './CheckoutSavedAddressToast';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('CheckoutSavedAddressToast', () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear();
  });

  it('opens the saved-address toast at the top right', () => {
    showCheckoutSavedAddressToast();

    expect(toast.success).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith(CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE, {
      id: 'checkout-saved-address',
      duration: 4000,
    });
  });
});
