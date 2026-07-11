import { render, screen, waitFor } from '@testing-library/react';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderTrackingPage from './page';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  ORDER_TRACKING_SEED_NUMBER,
  sampleOrderTracking,
} from '@/test/mocks/fixtures/order-tracking';
import { server } from '@/test/mocks/server';

const { mockUseParams } = vi.hoisted(() => ({
  mockUseParams: vi.fn(() => ({ orderNumber: ORDER_TRACKING_SEED_NUMBER })),
}));

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  usePathname: () => `/track/${ORDER_TRACKING_SEED_NUMBER}`,
  useRouter: () => ({ prefetch: vi.fn() }),
}));

const createWrapper = createApolloTestWrapper;

describe('OrderTrackingPage', () => {
  beforeEach(() => {
    mockUseParams.mockReturnValue({ orderNumber: ORDER_TRACKING_SEED_NUMBER });
  });

  it('reads orderNumber from route params and renders hook-driven success content', async () => {
    server.use(
      graphql.query('OrderTracking', ({ variables }) => {
        expect(variables).toEqual({ orderNumber: ORDER_TRACKING_SEED_NUMBER });
        return HttpResponse.json({
          data: { orderTracking: sampleOrderTracking },
        });
      }),
    );

    render(<OrderTrackingPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('order-tracking-success')).toBeInTheDocument();
    });

    expect(screen.getByText(ORDER_TRACKING_SEED_NUMBER)).toBeInTheDocument();
    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.queryByText('รายละเอียดคำสั่งซื้อ')).not.toBeInTheDocument();
  });

  it('renders not-found state for whitespace orderNumber without fetching', async () => {
    mockUseParams.mockReturnValue({ orderNumber: '   ' });

    const orderTrackingHandler = vi.fn();
    server.use(
      graphql.query('OrderTracking', () => {
        orderTrackingHandler();
        return HttpResponse.json({
          data: { orderTracking: sampleOrderTracking },
        });
      }),
    );

    render(<OrderTrackingPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: 'ไม่พบคำสั่งซื้อ' }),
      ).toBeInTheDocument();
    });

    expect(orderTrackingHandler).not.toHaveBeenCalled();
  });
});
