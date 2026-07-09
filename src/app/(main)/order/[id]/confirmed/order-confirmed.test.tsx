import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderConfirmedContent } from '@/app/(main)/order/[id]/confirmed/OrderConfirmedContent';
import { ThankYouPageContent } from '@/app/(main)/thank-you/[id]/ThankYouPageContent';
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

  it('shows recommended products section and uses order id route params only', async () => {
    server.use(
      graphql.query('Order', () => {
        return HttpResponse.json({ data: { order: sampleOrder } });
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

    expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    expect(screen.getByText('Recommended Treat Pack')).toBeInTheDocument();
    expect(screen.getByLabelText('สินค้าแนะนำ')).toBeInTheDocument();
  });
});
