import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { hasClientSession } from '@/lib/graphql/authLink';
import type { PaymentMethod } from '@/lib/providers/CheckoutProvider';
import { SavedCardCvvCancelledError } from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { useCheckoutSubmit } from '@/components/sections/CheckoutSection/useCheckoutSubmit';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockCreateOrder = vi.fn();
const mockCreatePayment = vi.fn();
const mockCreateAddress = vi.fn();
const mockRefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const mockClearPendingCheckout = vi.fn();
const mockSetPendingCheckout = vi.fn();
vi.mock('@/lib/checkout/pendingCheckout', () => ({
  clearPendingCheckout: () => mockClearPendingCheckout(),
  setPendingCheckout: (pending: unknown) => mockSetPendingCheckout(pending),
  getPendingCheckout: vi.fn(),
}));

const authState = {
  isAuthenticated: true,
  isLoading: false,
  customer: null as { id: string } | null,
};

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => authState,
}));

vi.mock('@/lib/graphql/authLink', () => ({
  hasClientSession: vi.fn(() => true),
}));

vi.mock('@/lib/payment/cardTransport', () => ({
  encryptCardSecurityCodeTransport: vi.fn(async (cvv: string) => `rsa:v1:cvv-${cvv}`),
  encryptCardTransportPayload: vi.fn(async () => 'rsa:v1:card-cipher'),
}));

vi.mock('@/lib/payment/saveCard', () => ({
  buildSaveCardPayload: vi.fn(async () => ({
    cardCipher: 'rsa:v1:card-cipher',
    isDefault: true,
  })),
}));

const mockPrepareCardPayment = vi.fn();
vi.mock(
  '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge')
      >();
    return {
      ...actual,
      prepareCardPayment: () => mockPrepareCardPayment(),
    };
  },
);

const mockClearBuyNow = vi.fn();
const cartSelectionState = {
  selectedItems: [
    {
      id: 'ci-1',
      variantId: 'var-1',
      quantity: 1,
      productVariant: {
        price: 100,
        product: { id: 'prod-1' },
      },
    },
  ],
  selectedSubtotal: 100,
  refetch: mockRefetch,
  pruneDeselectedIds: vi.fn(),
  isBuyNow: false,
  clearBuyNow: mockClearBuyNow,
};

vi.mock('@/lib/hooks/useCheckoutCartSelection', () => ({
  useCheckoutCartSelection: () => cartSelectionState,
}));

vi.mock('@/lib/hooks/useCheckout', () => ({
  useCheckout: () => ({
    validatePromotion: vi.fn(),
    createOrder: mockCreateOrder,
    createPayment: mockCreatePayment,
  }),
}));

const checkoutState = {
  step: 'review' as const,
  shippingByStoreId: { 'store-1': { shippingOptionId: 'ship-1' } },
  selectedAddressId: null as string | null,
  promotionCode: null,
  storePromotionsByStoreId: {},
  paymentMethod: 'promptpay' as PaymentMethod,
  isSubmitting: false,
  setIsSubmitting: vi.fn(),
  setStep: vi.fn(),
  setAddress: vi.fn(),
  canAdvanceToPayment: () => true,
  canAdvanceToReview: () => true,
};

vi.mock('@/lib/providers/CheckoutProvider', () => ({
  useCheckout: () => checkoutState,
}));

const guestForm: GuestCheckoutFormState = {
  contactPhone: '0812345678',
  recipientFullName: 'Somchai',
  recipientPhone: '0812345678',
  address: '123 Sukhumvit',
  district: 'Wattana',
  subDistrict: 'Khlong Tan Nuea',
  province: 'Bangkok',
  postalCode: '10110',
  email: '',
};

describe('useCheckoutSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cartSelectionState.isBuyNow = false;
    authState.isAuthenticated = true;
    authState.customer = null;
    vi.mocked(hasClientSession).mockReturnValue(true);
    checkoutState.step = 'review';
    checkoutState.selectedAddressId = null;
    checkoutState.paymentMethod = 'promptpay';
    checkoutState.isSubmitting = false;
    mockPrepareCardPayment.mockReset();
    mockReplace.mockReset();
    mockCreateAddress.mockReset();
    mockCreateOrder.mockReset();
    mockCreatePayment.mockReset();
  });

  it('shows toast when createAddress rejects long recipient name (SF-CHK-026)', async () => {
    mockCreateAddress.mockRejectedValue(
      Object.assign(new Error('recipientName must be shorter'), {
        graphQLErrors: [{ extensions: { code: 'VALIDATION_ERROR' } }],
      }),
    );

    const setFieldErrors = vi.fn();
    const setShowFieldErrors = vi.fn();

    const { result } = renderHook(() =>
      useCheckoutSubmit(guestForm, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: true,
          setFieldErrors,
          setShowFieldErrors,
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 0,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreateAddress).toHaveBeenCalled();
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to login when session cleared on member checkout (SF-CHK-115)', async () => {
    authState.isAuthenticated = false;
    vi.mocked(hasClientSession).mockReturnValue(false);
    checkoutState.selectedAddressId = 'addr-1';

    const { result } = renderHook(() =>
      useCheckoutSubmit(guestForm, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: true,
          setFieldErrors: vi.fn(),
          setShowFieldErrors: vi.fn(),
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 1,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockPush).toHaveBeenCalledWith('/login?returnUrl=%2Fcheckout');
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('unlocks checkout without an error toast when the CVV dialog is closed', async () => {
    checkoutState.paymentMethod = 'card' as typeof checkoutState.paymentMethod;
    mockPrepareCardPayment.mockRejectedValue(new SavedCardCvvCancelledError());

    const { result } = renderHook(() =>
      useCheckoutSubmit(guestForm, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: false,
          setFieldErrors: vi.fn(),
          setShowFieldErrors: vi.fn(),
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 0,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockPrepareCardPayment).toHaveBeenCalled();
    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(checkoutState.setIsSubmitting).toHaveBeenLastCalledWith(false);
  });

  it('skips createAddress when save-address is unchecked (SF-CHK-044)', async () => {
    mockCreateOrder.mockResolvedValue({
      id: 'ord-1',
      orderNumber: 'ORD-TEST',
      paymentMethod: 'promptpay',
    });
    mockCreatePayment.mockResolvedValue({ id: 'pay-1' });

    const { result } = renderHook(() =>
      useCheckoutSubmit(guestForm, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: false,
          setFieldErrors: vi.fn(),
          setShowFieldErrors: vi.fn(),
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 0,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreateAddress).not.toHaveBeenCalled();
    expect(mockCreateOrder).toHaveBeenCalled();
    const orderInput = mockCreateOrder.mock.calls[0]?.[0] as {
      shippingAddress?: { recipientName?: string };
      savedAddressId?: string;
    };
    expect(orderInput.shippingAddress?.recipientName).toBe('Somchai');
    expect(orderInput.savedAddressId).toBeUndefined();
    expect(mockReplace).toHaveBeenCalledWith('/payment/pay-1');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('does not clear buy-now session before navigating to payment', async () => {
    cartSelectionState.isBuyNow = true;
    cartSelectionState.selectedItems = [
      {
        id: 'buy-now:var-dog-food',
        variantId: 'var-dog-food',
        quantity: 1,
        productVariant: {
          price: 300,
          product: { id: 'prod-dog-food', storeId: 'store-beam' },
        },
      },
    ];
    cartSelectionState.selectedSubtotal = 300;
    checkoutState.selectedAddressId = 'addr-1';
    mockCreateOrder.mockResolvedValue({
      id: 'ord-1',
      orderNumber: 'ORD-MWYOKOUM-2AEB',
      paymentMethod: 'promptpay',
    });
    mockCreatePayment.mockResolvedValue({ id: 'pay-1' });

    const { result } = renderHook(() =>
      useCheckoutSubmit(guestForm, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: false,
          setFieldErrors: vi.fn(),
          setShowFieldErrors: vi.fn(),
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 1,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreateOrder).toHaveBeenCalled();
    expect(mockClearBuyNow).not.toHaveBeenCalled();
    expect(cartSelectionState.pruneDeselectedIds).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/payment/pay-1');
  });

  it('clears prior pending payment before create so reload cannot resume old QR (SF-CHK-110)', async () => {
    checkoutState.selectedAddressId = 'addr-1';

    const { result } = renderHook(() =>
      useCheckoutSubmit(null, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: false,
          setFieldErrors: vi.fn(),
          setShowFieldErrors: vi.fn(),
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 1,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockClearPendingCheckout).toHaveBeenCalled();
  });

  it('passes saveCard on createPayment instead of addPaymentMethod before charge', async () => {
    checkoutState.selectedAddressId = 'addr-1';
    checkoutState.paymentMethod = 'card';
    mockPrepareCardPayment.mockResolvedValue({
      type: 'token',
      cardToken: 'beam_tok_new',
      cardSecurityCode: '123',
      saveCardForNextTime: true,
      tokenizedCard: {
        cardToken: 'beam_tok_new',
        lastFour: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2030,
      },
      cardForm: {
        cardNumber: '4242424242424242',
        cardName: 'Test',
        expiry: '12/30',
        cvv: '123',
      },
    });
    mockCreateOrder.mockResolvedValue({
      id: 'ord-1',
      orderNumber: 'ORD-TEST',
      paymentMethod: 'credit_card',
    });
    mockCreatePayment.mockResolvedValue({ id: 'pay-1' });

    const { result } = renderHook(() =>
      useCheckoutSubmit(null, {
        addressSubmitContext: {
          createAddress: mockCreateAddress,
          setAddress: vi.fn(),
          saveAddressChecked: false,
          setFieldErrors: vi.fn(),
          setShowFieldErrors: vi.fn(),
          addressQueryError: undefined,
          addressQueryLoading: false,
          addressCount: 1,
        },
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreatePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        cardToken: 'beam_tok_new',
        cardSecurityCodeCipher: 'rsa:v1:cvv-123',
        saveCard: {
          cardCipher: 'rsa:v1:card-cipher',
          isDefault: true,
        },
      }),
    );
    expect(JSON.stringify(mockCreatePayment.mock.calls[0]?.[0])).not.toContain('4242424242424242');
    expect(JSON.stringify(mockCreatePayment.mock.calls[0]?.[0])).not.toMatch(/"123"/);
    expect(mockCreatePayment).toHaveBeenCalledWith(
      expect.not.objectContaining({
        savedPaymentMethodId: expect.anything(),
      }),
    );
  });
});
