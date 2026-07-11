import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { graphql, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrderTrackingPage from './page';
import { ORDER_STATUS_LABELS } from '@/lib/constants/orderStatus';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import {
  ORDER_TRACKING_SEED_NUMBER,
  sampleOrderTracking,
} from '@/test/mocks/fixtures/order-tracking';
import { sampleSavedAddress } from '@/test/mocks/fixtures/checkout';
import { server } from '@/test/mocks/server';

// AC-001–AC-007, AC-019: Public track page success journey with PII/CTA guards.
// Behavior: visit /track/{orderNumber} → MSW success → status, items, totals, shipment link; no PII/CTAs.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: full-ui (track route + OrderTrackingPageContent + summary + shipment list), mocked orderTracking GraphQL
// @complexity: high
// ROI: 109

// AC-016: Identical not-found for malformed param vs ORDER_NOT_FOUND API.
// Behavior: garbage/malformed params + ORDER_NOT_FOUND → same not-found copy; no retry UI.
// @category: edge-case
// @lane: fixture-e2e
// @dependency: OrderTrackingPageContent + OrderTrackingNotFoundState, mocked ORDER_NOT_FOUND
// @complexity: medium
// ROI: 81

// AC-015: Network error shows retry UI; retry refetches and succeeds.
// Behavior: MSW network error → error state → retry → second fetch success.
// @category: fixture-e2e
// @lane: fixture-e2e
// @dependency: OrderTrackingPage + OrderTrackingErrorState + useOrderTracking refetch, MSW network error then success
// @complexity: medium
// ROI: 64

const NOT_FOUND_HEADING = 'ไม่พบคำสั่งซื้อ';
const NOT_FOUND_BODY = 'ไม่พบคำสั่งซื้อที่คุณค้นหา กรุณาตรวจสอบลิงก์จากผู้ขายอีกครั้ง';

const FORBIDDEN_PII_STRINGS = [
  sampleSavedAddress.fullName,
  sampleSavedAddress.phone,
  sampleSavedAddress.addressLine1,
  'user@example.com',
] as const;

const FORBIDDEN_CTA_LABELS = ['ชำระเงิน', 'ยืนยันได้รับสินค้าแล้ว', 'เขียนรีวิว'] as const;

const { mockUseParams } = vi.hoisted(() => ({
  mockUseParams: vi.fn(() => ({ orderNumber: ORDER_TRACKING_SEED_NUMBER })),
}));

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  usePathname: () => `/track/${ORDER_TRACKING_SEED_NUMBER}`,
  useRouter: () => ({ prefetch: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const createWrapper = createApolloTestWrapper;

function renderTrackPage(orderNumber: string) {
  mockUseParams.mockReturnValue({ orderNumber });
  return render(<OrderTrackingPage />, { wrapper: createWrapper() });
}

function getNotFoundTextSnapshot() {
  const container = screen.getByTestId('order-tracking-not-found');

  return {
    heading: screen.getByRole('heading', { level: 1 }).textContent,
    body: container.querySelector('p')?.textContent ?? '',
  };
}

function assertNoPiiOrAuthenticatedCtas() {
  for (const pii of FORBIDDEN_PII_STRINGS) {
    expect(screen.queryByText(pii)).not.toBeInTheDocument();
  }

  for (const label of FORBIDDEN_CTA_LABELS) {
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: label })).not.toBeInTheDocument();
  }
}

beforeEach(() => {
  mockUseParams.mockReturnValue({ orderNumber: ORDER_TRACKING_SEED_NUMBER });
});

describe('Order tracking page fixture-e2e', () => {
  it('renders success content with shipment link and without PII or authenticated CTAs', async () => {
    server.use(
      graphql.query('OrderTracking', ({ variables }) => {
        expect(variables).toEqual({ orderNumber: ORDER_TRACKING_SEED_NUMBER });
        return HttpResponse.json({
          data: { orderTracking: sampleOrderTracking },
        });
      }),
    );

    renderTrackPage(ORDER_TRACKING_SEED_NUMBER);

    await waitFor(() => {
      expect(screen.getByTestId('order-tracking-success')).toBeInTheDocument();
    });

    expect(screen.getByText(ORDER_TRACKING_SEED_NUMBER)).toBeInTheDocument();
    expect(screen.getByText(ORDER_STATUS_LABELS.paid)).toBeInTheDocument();
    expect(screen.getByText(formatThaiDateTime(sampleOrderTracking.createdAt))).toBeInTheDocument();
    expect(screen.getByText('Premium Dog Food 5kg')).toBeInTheDocument();
    expect(screen.getByTestId('product-thumbnail-image')).toHaveAttribute(
      'src',
      sampleOrderTracking.items[0].productImageUrl!,
    );
    expect(screen.getByText('จำนวน 1 × ฿500')).toBeInTheDocument();
    expect(screen.getByText('จัดส่งมาตรฐาน')).toBeInTheDocument();
    expect(screen.getByTestId('order-confirmation-total')).toHaveTextContent('฿540');
    expect(screen.getByText('ติดตามพัสดุ')).toBeInTheDocument();

    const trackingLink = screen.getByRole('link', { name: 'เปิดลิงก์ติดตามพัสดุ' });
    expect(trackingLink).toHaveAttribute('href', sampleOrderTracking.items[0].trackingUrl);
    expect(trackingLink.getAttribute('rel')).toMatch(/noopener/);
    expect(trackingLink.getAttribute('rel')).toMatch(/noreferrer/);

    assertNoPiiOrAuthenticatedCtas();
    expect(screen.queryByText('รายละเอียดคำสั่งซื้อ')).not.toBeInTheDocument();
  });

  it('renders identical not-found copy for garbage param and ORDER_NOT_FOUND API', async () => {
    server.use(
      graphql.query('OrderTracking', () => {
        return HttpResponse.json({
          errors: [
            {
              message: 'Order not found',
              extensions: { code: 'ORDER_NOT_FOUND' },
            },
          ],
        });
      }),
    );

    const captureNotFoundSnapshot = async (orderNumber: string) => {
      const view = renderTrackPage(orderNumber);

      await waitFor(() => {
        expect(screen.getByTestId('order-tracking-not-found')).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBe(screen.getByTestId('order-tracking-not-found'));
      expect(
        screen.getByRole('heading', { level: 1, name: NOT_FOUND_HEADING }),
      ).toBeInTheDocument();
      expect(screen.getByText(NOT_FOUND_BODY)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'กลับหน้าหลัก' })).toHaveAttribute('href', '/');
      expect(screen.queryByRole('button', { name: 'ลองอีกครั้ง' })).not.toBeInTheDocument();
      expect(screen.queryByText(/รูปแบบ|invalid/i)).not.toBeInTheDocument();

      const snapshot = getNotFoundTextSnapshot();
      view.unmount();
      return snapshot;
    };

    const garbageSnapshot = await captureNotFoundSnapshot('ORD-GARBAGE');
    const malformedSnapshot = await captureNotFoundSnapshot('not-a-real-format');

    expect(garbageSnapshot).toStrictEqual(malformedSnapshot);
    expect(garbageSnapshot).toEqual({
      heading: NOT_FOUND_HEADING,
      body: NOT_FOUND_BODY,
    });
  });

  it('refetches on retry after network error and shows success content', async () => {
    const user = userEvent.setup();
    let callCount = 0;

    server.use(
      graphql.query('OrderTracking', () => {
        callCount += 1;

        if (callCount === 1) {
          return HttpResponse.error();
        }

        return HttpResponse.json({
          data: { orderTracking: sampleOrderTracking },
        });
      }),
    );

    renderTrackPage(ORDER_TRACKING_SEED_NUMBER);

    await waitFor(() => {
      expect(screen.getByTestId('order-tracking-error')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'ไม่สามารถโหลดข้อมูลได้' }),
    ).toBeInTheDocument();
    expect(screen.getByText('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองอีกครั้ง')).toBeInTheDocument();
    expect(screen.queryByText('Premium Dog Food 5kg')).not.toBeInTheDocument();
    expect(screen.queryByText(ORDER_TRACKING_SEED_NUMBER)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));

    await waitFor(() => {
      expect(screen.getByTestId('order-tracking-success')).toBeInTheDocument();
    });

    expect(callCount).toBe(2);
    expect(screen.getByText(ORDER_TRACKING_SEED_NUMBER)).toBeInTheDocument();
    expect(screen.queryByTestId('order-tracking-error')).not.toBeInTheDocument();
  });
});
