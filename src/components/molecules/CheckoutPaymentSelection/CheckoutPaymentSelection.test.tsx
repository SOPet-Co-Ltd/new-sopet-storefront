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

  it('collects CVV for the selected saved card and requires it before paying', async () => {
    const user = userEvent.setup();
    renderSelection();

    await user.click(await screen.findByTestId('payment-method-card'));

    const cvvInput = await screen.findByTestId('saved-card-cvv-input');
    await waitFor(() => expect(isCheckoutCardPaymentReady()).toBe(false));
    await expect(prepareCardPayment()).rejects.toThrow('กรุณากรอกรหัส CVV ของบัตรที่บันทึกไว้');

    await user.type(cvvInput, '123');

    await waitFor(() => expect(isCheckoutCardPaymentReady()).toBe(true));
    await expect(prepareCardPayment()).resolves.toEqual({
      type: 'saved',
      savedPaymentMethodId: 'saved-card-1',
      cardSecurityCode: '123',
    });
  });
});
