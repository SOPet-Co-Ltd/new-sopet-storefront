import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountReviewsPage } from '@/components/pages/AccountReviewsPage';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  sampleMyReview,
  sampleReviewableItem,
} from '@/test/mocks/fixtures/account';
import { server } from '@/test/mocks/server';

const mockPush = vi.fn();

let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: vi.fn() }),
  usePathname: () => '/user/reviews',
  useSearchParams: () => searchParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img alt={alt} src={src} {...props} />
  ),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = createApolloTestWrapper;

beforeEach(() => {
  searchParams = new URLSearchParams();
  mockPush.mockReset();
});

describe('AccountReviewsPage', () => {
  it('renders pending tab by default', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: 'รอดำเนินการ' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await screen.findByText(sampleReviewableItem.productName)).toBeInTheDocument();
  });

  it('renders written tab from search params', async () => {
    searchParams = new URLSearchParams({ tab: 'written' });

    server.use(
      graphql.query('MyReviews', () => {
        return HttpResponse.json({
          data: { myReviews: [sampleMyReview] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: 'เขียนแล้ว' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText(sampleMyReview.productName)).toBeInTheDocument();
  });

  it('falls back to pending tab when tab param is invalid', async () => {
    searchParams = new URLSearchParams({ tab: 'invalid' });

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(screen.getByRole('tab', { name: 'รอดำเนินการ' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(await screen.findByText(sampleReviewableItem.productName)).toBeInTheDocument();
  });

  it('shows pending empty state with orders link', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('ยังไม่มีสินค้าที่รอให้รีวิว')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ดูคำสั่งซื้อ' })).toHaveAttribute(
      'href',
      '/user/orders',
    );
  });

  it('shows written empty state', async () => {
    searchParams = new URLSearchParams({ tab: 'written' });

    server.use(
      graphql.query('MyReviews', () => {
        return HttpResponse.json({
          data: { myReviews: [] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('ยังไม่มีรีวิวที่เขียนแล้ว')).toBeInTheDocument();
  });

  it('shows error panel with retry on query failure', async () => {
    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          errors: [{ message: 'Network error' }],
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(await screen.findByText('ไม่สามารถโหลดข้อมูลรีวิวได้')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ลองอีกครั้ง' })).toBeInTheDocument();
  });

  it('shows loading skeletons while pending tab loads', () => {
    server.use(
      graphql.query('CustomerReviewableItems', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId('reviews-loading-skeleton')).toBeInTheDocument();
    expect(screen.getAllByTestId('account-card-loading')).toHaveLength(3);
  });

  it('updates URL when written tab is selected', async () => {
    const user = userEvent.setup();

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
      graphql.query('MyReviews', () => {
        return HttpResponse.json({
          data: { myReviews: [sampleMyReview] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    await screen.findByText(sampleReviewableItem.productName);

    await user.click(screen.getByRole('tab', { name: 'เขียนแล้ว' }));

    expect(mockPush).toHaveBeenCalledWith('/user/reviews?tab=written');
  });

  it('clears tab param when pending tab is selected', async () => {
    const user = userEvent.setup();
    searchParams = new URLSearchParams({ tab: 'written' });

    server.use(
      graphql.query('MyReviews', () => {
        return HttpResponse.json({
          data: { myReviews: [sampleMyReview] },
        });
      }),
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    await screen.findByText(sampleMyReview.productName);

    await user.click(screen.getByRole('tab', { name: 'รอดำเนินการ' }));

    expect(mockPush).toHaveBeenCalledWith('/user/reviews');
  });

  it('opens review modal and submits createReview with orderId from selection', async () => {
    const user = userEvent.setup();
    let mutationInput: Record<string, unknown> | undefined;

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
      graphql.mutation('CreateReview', ({ variables }) => {
        mutationInput = variables.input as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            createReview: {
              id: 'review-new',
              productId: sampleReviewableItem.productId,
              rating: 5,
              comment: 'ดีมาก',
              status: 'pending',
              createdAt: new Date().toISOString(),
              customerName: 'ลูกค้า',
            },
          },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    await screen.findByText(sampleReviewableItem.productName);

    await user.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
    expect(screen.getByRole('heading', { level: 2, name: 'รีวิวสินค้า' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ให้ 5 ดาว' }));
    await user.type(
      screen.getByPlaceholderText('แบ่งปันประสบการณ์ของคุณ'),
      'ดีมาก',
    );
    await user.click(screen.getByRole('button', { name: 'ยืนยัน' }));

    await waitFor(() => {
      expect(mutationInput).toMatchObject({
        productId: sampleReviewableItem.productId,
        orderId: sampleReviewableItem.orderId,
        rating: 5,
        comment: 'ดีมาก',
      });
    });
  });

  it('disables write review CTA when review deadline has passed', async () => {
    const expiredItem = {
      ...sampleReviewableItem,
      reviewDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    };

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [expiredItem] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    await screen.findByText(expiredItem.productName);

    expect(screen.getByRole('button', { name: 'เขียนรีวิว' })).toBeDisabled();
  });

  it('removes submitted item from pending list after refetch', async () => {
    const user = userEvent.setup();
    let reviewableItems = [sampleReviewableItem];

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: reviewableItems },
        });
      }),
      graphql.mutation('CreateReview', () => {
        reviewableItems = [];
        return HttpResponse.json({
          data: {
            createReview: {
              id: 'review-new',
              productId: sampleReviewableItem.productId,
              rating: 5,
              comment: 'ดีมาก',
              status: 'pending',
              createdAt: new Date().toISOString(),
              customerName: 'ลูกค้า',
            },
          },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    await screen.findByText(sampleReviewableItem.productName);

    await user.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
    await user.click(screen.getByRole('button', { name: 'ให้ 5 ดาว' }));
    await user.click(screen.getByRole('button', { name: 'ยืนยัน' }));

    await waitFor(() => {
      expect(screen.queryByText(sampleReviewableItem.productName)).not.toBeInTheDocument();
    });
    expect(await screen.findByText('ยังไม่มีสินค้าที่รอให้รีวิว')).toBeInTheDocument();
  });

  it('refetches data when retry button is clicked after error', async () => {
    const user = userEvent.setup();
    let callCount = 0;

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        callCount += 1;
        if (callCount === 1) {
          return HttpResponse.json({
            errors: [{ message: 'Network error' }],
          });
        }
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    expect(await screen.findByText('ไม่สามารถโหลดข้อมูลรีวิวได้')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));

    expect(await screen.findByText(sampleReviewableItem.productName)).toBeInTheDocument();
    expect(callCount).toBe(2);
  });

  it('shows REVIEW_WINDOW_EXPIRED error in modal on submit failure', async () => {
    const user = userEvent.setup();

    server.use(
      graphql.query('CustomerReviewableItems', () => {
        return HttpResponse.json({
          data: { customerReviewableItems: [sampleReviewableItem] },
        });
      }),
      graphql.mutation('CreateReview', () => {
        return HttpResponse.json({
          errors: [
            {
              message: 'Review window expired',
              extensions: { code: 'REVIEW_WINDOW_EXPIRED' },
            },
          ],
        });
      }),
    );

    render(<AccountReviewsPage />, { wrapper: createWrapper() });
    await screen.findByText(sampleReviewableItem.productName);

    await user.click(screen.getByRole('button', { name: 'เขียนรีวิว' }));
    await user.click(screen.getByRole('button', { name: 'ให้ 5 ดาว' }));
    await user.click(screen.getByRole('button', { name: 'ยืนยัน' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('หมดเวลาในการเขียนรีวิวแล้ว');
    expect(screen.getByRole('heading', { level: 2, name: 'รีวิวสินค้า' })).toBeInTheDocument();
  });
});
