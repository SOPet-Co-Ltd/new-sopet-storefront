import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CheckoutPage from '@/app/(checkout)/checkout/page';
import { CheckoutPaymentSelection } from '@/components/molecules/CheckoutPaymentSelection/CheckoutPaymentSelection';
import { CheckoutPromotionSection } from '@/components/sections/CheckoutPromotionSection/CheckoutPromotionSection';
import { CartDocument } from '@/lib/graphql/generated/graphql';
import { CartProvider } from '@/lib/providers/CartProvider';
import {
  CheckoutProvider,
  useCheckout,
  type CheckoutContextValue,
} from '@/lib/providers/CheckoutProvider';
import { SESSION_ID_COOKIE } from '@/lib/session';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { sampleCart } from '@/test/mocks/fixtures/cart';
import { samplePromotionValidation } from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/checkout',
}));

const { TEST_SESSION_ID, mockEnsureSessionId } = vi.hoisted(() => {
  const id = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
  return {
    TEST_SESSION_ID: id,
    mockEnsureSessionId: vi.fn(() => id),
  };
});

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>();
  return {
    ...actual,
    ensureSessionId: mockEnsureSessionId,
    getSessionId: mockEnsureSessionId,
  };
});

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    customer: null,
    isAuthenticated: false,
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
    paymentMethods: [],
    loading: false,
    error: undefined,
    refetch: vi.fn(),
    addPaymentMethod: vi.fn(),
    deletePaymentMethod: vi.fn(),
    setDefaultPaymentMethod: vi.fn(),
  })),
}));

function CheckoutPageReset() {
  const { reset } = useCheckout();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return null;
}

function CheckoutStateProbe({
  onContext,
}: {
  onContext: (context: CheckoutContextValue) => void;
}) {
  const context = useCheckout();
  onContext(context);
  return (
    <div
      data-testid="checkout-state-probe"
      data-step={context.step}
      data-shipping-count={Object.keys(context.shippingByStoreId).length}
    />
  );
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    document.cookie = `${SESSION_ID_COOKIE}=${TEST_SESSION_ID}; path=/`;
    mockReplace.mockReset();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('redirects away when cart is empty', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: CartDocument, variables: { sessionId: TEST_SESSION_ID } },
            result: {
              data: {
                cart: { id: 'cart-1', sessionId: TEST_SESSION_ID, customerId: null, items: [] },
              },
            },
          },
        ]}
      >
        <CartProvider>
          <CheckoutProvider>
            <CheckoutPage />
          </CheckoutProvider>
        </CartProvider>
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/cart');
    });
  });

  it('renders checkout content when cart has items', async () => {
    render(
      <MockedProvider
        mocks={[
          {
            request: { query: CartDocument, variables: { sessionId: TEST_SESSION_ID } },
            result: { data: { cart: sampleCart } },
          },
        ]}
      >
        <CartProvider>
          <CheckoutProvider>
            <CheckoutPage />
          </CheckoutProvider>
        </CartProvider>
      </MockedProvider>,
    );

    expect(await screen.findByTestId('checkout-page')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-promotion-section')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-payment-selection')).toBeInTheDocument();
  });
});

describe('CheckoutPage reset on unmount', () => {
  let roots: Root[] = [];
  let context: CheckoutContextValue | null = null;

  afterEach(() => {
    for (const root of roots) {
      act(() => {
        root.unmount();
      });
    }
    roots = [];
    context = null;
    document.body.innerHTML = '';
  });

  it('calls CheckoutProvider.reset when checkout reset wrapper unmounts', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    roots.push(root);

    act(() => {
      root.render(
        <CheckoutProvider>
          <CheckoutStateProbe
            onContext={(value) => {
              context = value;
            }}
          />
          <CheckoutPageReset />
        </CheckoutProvider>,
      );
    });

    act(() => {
      context!.setRequiredStoreIds(['store-1']);
      context!.setShipping('store-1', { shippingOptionId: 'ship-opt-1' });
      context!.setStep('payment');
      context!.setPaymentMethod('promptpay');
    });

    expect(container.querySelector('[data-step]')?.getAttribute('data-step')).toBe('payment');

    act(() => {
      root.render(
        <CheckoutProvider>
          <CheckoutStateProbe
            onContext={(value) => {
              context = value;
            }}
          />
        </CheckoutProvider>,
      );
    });

    expect(container.querySelector('[data-step]')?.getAttribute('data-step')).toBe('shipping');
    expect(container.querySelector('[data-shipping-count]')?.getAttribute('data-shipping-count')).toBe(
      '0',
    );
    expect(context!.paymentMethod).toBeNull();
  });
});

describe('CheckoutPromotionSection', () => {
  const ApolloTestWrapper = createApolloTestWrapper();

  beforeEach(() => {
    document.cookie = `${SESSION_ID_COOKIE}=${TEST_SESSION_ID}; path=/`;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders promotion code input without coupons page link', async () => {
    const user = userEvent.setup();

    server.use(
      graphql.query('Cart', () => {
        return HttpResponse.json({ data: { cart: sampleCart } });
      }),
      graphql.query('ValidatePromotion', () => {
        return HttpResponse.json({
          data: { validatePromotion: samplePromotionValidation },
        });
      }),
    );

    render(
      <ApolloTestWrapper>
        <CartProvider>
          <CheckoutProvider>
            <CheckoutPromotionSection />
          </CheckoutProvider>
        </CartProvider>
      </ApolloTestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('promotion-code-input')).toBeInTheDocument();
    });

    expect(screen.getByTestId('promotion-apply-button')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /คูปอง/i })).not.toBeInTheDocument();

    expect(await screen.findByTestId('platform-promotion-suggest-button')).toHaveTextContent(
      'พบ 1 ส่วนลดที่ใช้ได้',
    );

    await user.type(screen.getByTestId('promotion-code-input'), 'SAVE10');
    await user.click(screen.getByTestId('promotion-apply-button'));

    expect(await screen.findByTestId('applied-platform-promotion')).toHaveTextContent('ลด 10 บาท');
  });

  it('shows empty state when no platform promotions are available', async () => {
    server.use(
      graphql.query('Cart', () => {
        return HttpResponse.json({ data: { cart: sampleCart } });
      }),
      graphql.query('ActivePlatformPromotions', () => {
        return HttpResponse.json({ data: { activePlatformPromotions: [] } });
      }),
    );

    render(
      <ApolloTestWrapper>
        <CartProvider>
          <CheckoutProvider>
            <CheckoutPromotionSection />
          </CheckoutProvider>
        </CartProvider>
      </ApolloTestWrapper>,
    );

    expect(await screen.findByTestId('platform-promotion-picker-button')).toHaveTextContent(
      'เลือกส่วนลดแพลตฟอร์ม',
    );
    expect(screen.getByTestId('checkout-promotion-section')).toHaveAttribute('data-stage', 'empty');
    expect(screen.queryByTestId('platform-promotion-suggest-button')).not.toBeInTheDocument();
  });
});

describe('CheckoutPaymentSelection', () => {
  it('updates paymentMethod in context on tab click', async () => {
    const user = userEvent.setup();
    let context: CheckoutContextValue | null = null;

    render(
      <CheckoutProvider>
        <CheckoutStateProbe
          onContext={(value) => {
            context = value;
          }}
        />
        <CheckoutPaymentSelection />
      </CheckoutProvider>,
    );

    await user.click(screen.getByTestId('payment-method-card'));

    expect(context!.paymentMethod).toBe('card');
    expect(screen.getByTestId('checkout-card-payment-form')).toBeInTheDocument();
  });

  it('defaults to promptpay on mount', async () => {
    let context: CheckoutContextValue | null = null;

    render(
      <CheckoutProvider>
        <CheckoutStateProbe
          onContext={(value) => {
            context = value;
          }}
        />
        <CheckoutPaymentSelection />
      </CheckoutProvider>,
    );

    await waitFor(() => {
      expect(context!.paymentMethod).toBe('promptpay');
    });
  });

  it('accepts card number input', async () => {
    const user = userEvent.setup();

    render(
      <CheckoutProvider>
        <CheckoutPaymentSelection />
      </CheckoutProvider>,
    );

    await user.click(screen.getByTestId('payment-method-card'));
    const cardNumberInput = screen.getByTestId('card-number-input');

    await user.type(cardNumberInput, '4111111111111111');

    expect(cardNumberInput).toHaveValue('4111-1111-1111-1111');
  });
});
