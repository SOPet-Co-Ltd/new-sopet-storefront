import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CheckoutProvider } from '@/lib/providers/CheckoutProvider';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { CheckoutPaymentSelection } from './CheckoutPaymentSelection';
import {
  isCheckoutCardPaymentReady,
  prepareCardPayment,
  registerCheckoutCardPaymentBridge,
} from './checkoutCardPaymentBridge';

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: null,
    isAuthenticated: true,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('@/lib/hooks/usePaymentMethods', () => ({
  usePaymentMethods: vi.fn(() => ({
    paymentMethods: [
      {
        id: 'saved-card-1',
        brand: 'visa',
        lastFour: '4242',
        expiryMonth: 12,
        expiryYear: 2030,
        isDefault: true,
        psp: 'beam',
      },
    ],
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    addPaymentMethod: vi.fn(),
    deletePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
  })),
}));

vi.mock('@/lib/hooks/useCheckoutTotals', () => ({
  useCheckoutTotals: vi.fn(() => ({
    subtotal: 907,
    itemCount: 1,
    storeDiscountTotal: 0,
    storeDiscountByStoreId: {},
    platformPromotionDiscount: 0,
    totalDiscount: 0,
    shippingFeeTotal: 0,
    finalPrice: 907,
    savingsTotal: 0,
    isShippingComplete: true,
  })),
}));

vi.mock('@/lib/hooks/useCheckoutCartSelection', () => ({
  useCheckoutCartSelection: vi.fn(() => ({
    selectedItemCount: 1,
    selectedSubtotal: 907,
    selectedItemsByStore: [],
  })),
}));

function renderSelection() {
  const Wrapper = createApolloTestWrapper();
  return render(
    <Wrapper>
      <CheckoutProvider>
        <CheckoutPaymentSelection />
      </CheckoutProvider>
    </Wrapper>,
  );
}

describe('CheckoutPaymentSelection saved card CVV', () => {
  beforeEach(() => {
    registerCheckoutCardPaymentBridge(null);
  });

  afterEach(() => {
    registerCheckoutCardPaymentBridge(null);
  });

  it('opens the CVV modal when paying with a selected saved card', async () => {
    const user = userEvent.setup();
    renderSelection();

    await user.click(await screen.findByTestId('payment-method-card'));
    expect(screen.queryByTestId('saved-card-cvv-input')).not.toBeInTheDocument();

    await waitFor(() => expect(isCheckoutCardPaymentReady()).toBe(true));

    const preparePromise = prepareCardPayment();
    expect(await screen.findByTestId('saved-card-cvv-modal')).toBeInTheDocument();

    await user.type(screen.getByTestId('saved-card-cvv-modal-input'), '123');
    await user.click(screen.getByTestId('saved-card-cvv-modal-confirm'));

    await expect(preparePromise).resolves.toEqual({
      type: 'saved',
      savedPaymentMethodId: 'saved-card-1',
      cardSecurityCode: '123',
    });
  });
});
