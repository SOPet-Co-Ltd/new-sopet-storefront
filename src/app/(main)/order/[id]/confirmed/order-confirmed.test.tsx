import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderConfirmedContent } from '@/app/(main)/order/[id]/confirmed/OrderConfirmedContent';
import { ThankYouPageContent } from '@/app/(main)/thank-you/[id]/ThankYouPageContent';
import { setPendingCheckout } from '@/lib/checkout/pendingCheckout';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { CHECKOUT_ORDER_ID, sampleOrder } from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';

const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
  useParams: () => ({ id: CHECKOUT_ORDER_ID }),
  usePathname: () => `/order/${CHECKOUT_ORDER_ID}/confirmed`,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,
    pendingDeletion: false,
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    reactivateAccount: vi.fn(),
    logout: vi.fn(),
  }),
}));

const createWrapper = createApolloTestWrapper;

const paidPaymentByOrderId = {
  __typename: 'PaymentType' as const,
  id: 'pay-1',
  orderId: CHECKOUT_ORDER_ID,
  orderNumber: 'ORD-1001',
  amount: 540,
  currency: 'THB',
  status: 'paid',
  paymentMethod: 'promptpay',
  authorizeUri: null,
  qrCodeUrl: null,
  expiresAt: null,
};

describe('OrderConfirmedContent', () => {
  it('renders order number and line items from GraphQL', async () => {
    server.use(
      graphql.query('Order', ({ variables }) => {
        expect(variables).toEqual({ id: CHECKOUT_ORDER_ID });
        return HttpResponse.json({ data: { order: sampleOrder } });
      }),
    );

    render(<OrderConfirmedContent orderId={CHECKOUT_ORDER_ID} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('order-confirmation-item')).toHaveLength(1);
    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByTestId('order-confirmation-total')).toHaveTextContent('฿540');
  });
});

describe('ThankYouPageContent', () => {
  beforeEach(() => {
    sessionStorage.clear();
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

  it('guest mode loads ORD- from PaymentByOrderId and never queries Order', async () => {
    const orderQuery = vi.fn();
    server.use(
      graphql.query('Order', () => {
        orderQuery();
        return HttpResponse.json({
          errors: [{ message: 'Unauthorized' }],
        });
      }),
      graphql.query('PaymentByOrderId', ({ variables }) => {
        expect(variables).toEqual({ orderId: CHECKOUT_ORDER_ID });
        return HttpResponse.json({
          data: {
            paymentByOrderId: {
              ...paidPaymentByOrderId,
              orderNumber: 'ORD-GUEST-1001',
            },
          },
        });
      }),
      graphql.query('RecommendedProducts', () => {
        return HttpResponse.json({ data: { recommendedProducts: [] } });
      }),
    );

    render(<ThankYouPageContent orderId={CHECKOUT_ORDER_ID} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByTestId('thank-you-order-number')).toHaveTextContent('ORD-GUEST-1001');
    });
    expect(orderQuery).not.toHaveBeenCalled();
    expect(screen.queryByText(CHECKOUT_ORDER_ID)).not.toBeInTheDocument();
  });

  it('uses pending checkout ORD- immediately for guests while payment loads', async () => {
    setPendingCheckout({
      paymentId: 'pay-1',
      orderId: CHECKOUT_ORDER_ID,
      orderNumber: 'ORD-PENDING-1001',
    });

    let resolvePayment: ((value: unknown) => void) | undefined;
    const paymentResponse = new Promise((resolve) => {
      resolvePayment = resolve;
    });

    server.use(
      graphql.query('PaymentByOrderId', async () => {
        await paymentResponse;
        return HttpResponse.json({
          data: { paymentByOrderId: paidPaymentByOrderId },
        });
      }),
      graphql.query('RecommendedProducts', () => {
        return HttpResponse.json({ data: { recommendedProducts: [] } });
      }),
    );

    render(<ThankYouPageContent orderId={CHECKOUT_ORDER_ID} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId('thank-you-order-number')).toHaveTextContent('ORD-PENDING-1001');
    expect(screen.queryByText(CHECKOUT_ORDER_ID)).not.toBeInTheDocument();

    resolvePayment?.(undefined);
    await waitFor(() => {
      expect(screen.getByTestId('thank-you-order-number')).toHaveTextContent('ORD-PENDING-1001');
    });
  });

  it('never flashes the raw route order id — only ORD- customer codes', async () => {
    let resolvePayment: ((value: unknown) => void) | undefined;
    const paymentResponse = new Promise((resolve) => {
      resolvePayment = resolve;
    });

    server.use(
      graphql.query('PaymentByOrderId', async () => {
        await paymentResponse;
        return HttpResponse.json({
          data: { paymentByOrderId: paidPaymentByOrderId },
        });
      }),
      graphql.query('RecommendedProducts', () => {
        return HttpResponse.json({ data: { recommendedProducts: [] } });
      }),
    );

    render(<ThankYouPageContent orderId={CHECKOUT_ORDER_ID} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId('thank-you-order-number-pending')).toBeInTheDocument();
    expect(screen.queryByText(CHECKOUT_ORDER_ID)).not.toBeInTheDocument();
    expect(screen.queryByTestId('thank-you-order-number')).not.toBeInTheDocument();

    resolvePayment?.(undefined);

    await waitFor(() => {
      expect(screen.getByTestId('thank-you-order-number')).toHaveTextContent('ORD-1001');
    });
    expect(screen.queryByText(CHECKOUT_ORDER_ID)).not.toBeInTheDocument();
  });

  it('shows recommended products section and uses order id route params only', async () => {
    server.use(
      graphql.query('PaymentByOrderId', () => {
        return HttpResponse.json({
          data: { paymentByOrderId: paidPaymentByOrderId },
        });
      }),
      graphql.query('RecommendedProducts', () => {
        return HttpResponse.json({
          data: {
            recommendedProducts: [
              {
                __typename: 'ProductType',
                id: 'prod-1',
                name: 'Recommended Treat Pack',
                slug: 'premium-dog-food-5kg',
                storeId: 'store-1',
                basePrice: 890,
                compareAtPrice: null,
                thumbnailUrl: 'https://example.com/dog-food.jpg',
                averageRating: 4.5,
                reviewCount: 12,
                soldCount: 48,
              },
            ],
          },
        });
      }),
    );

    render(<ThankYouPageContent orderId={CHECKOUT_ORDER_ID} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getAllByText('ORD-1001').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('สินค้าแนะนำ')).toBeInTheDocument();
    expect(screen.getByText('Recommended Treat Pack')).toBeInTheDocument();
    expect(screen.getByLabelText('สินค้าแนะนำ')).toBeInTheDocument();
  });
});
