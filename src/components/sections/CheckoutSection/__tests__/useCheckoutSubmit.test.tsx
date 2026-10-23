import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import { hasClientSession } from '@/lib/graphql/authLink';
import { useCheckoutSubmit } from '@/components/sections/CheckoutSection/useCheckoutSubmit';

const mockPush = vi.fn();
const mockCreateOrder = vi.fn();
const mockCreatePayment = vi.fn();
const mockCreateAddress = vi.fn();
const mockRefetch = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
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

vi.mock('@/lib/hooks/usePaymentMethods', () => ({
  usePaymentMethods: () => ({
    paymentMethods: [],
    addPaymentMethod: vi.fn(),
  }),
}));

vi.mock('@/lib/hooks/useCheckoutCartSelection', () => ({
  useCheckoutCartSelection: () => ({
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
    clearBuyNow: vi.fn(),
  }),
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
  paymentMethod: 'promptpay' as const,
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
    authState.isAuthenticated = true;
    authState.customer = null;
    vi.mocked(hasClientSession).mockReturnValue(true);
    checkoutState.step = 'review';
    checkoutState.selectedAddressId = null;
    checkoutState.isSubmitting = false;
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
});
