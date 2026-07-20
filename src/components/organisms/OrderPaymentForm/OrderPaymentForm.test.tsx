import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderPaymentForm } from '@/components/organisms/OrderPaymentForm/OrderPaymentForm';
import {
  resetPayment3dsAutoRedirectMemory,
  threeDSAutoRedirectStorageKey,
} from '@/components/organisms/OrderPaymentForm/Payment3dsAutoRedirect';
import type { PaymentRecord } from '@/lib/hooks/usePayment';
import { CHECKOUT_ORDER_ID, samplePendingPayment } from '@/test/mocks/fixtures/checkout';

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

const basePayment: PaymentRecord = samplePendingPayment;
const futureExpiresAt = '2030-01-01T00:00:00.000Z';
const pastExpiresAt = '2020-01-01T00:00:00.000Z';
const AUTHORIZE_URI = 'https://pay.omise.co/offsites/ofsp_test/pay';

const cardPendingPayment: PaymentRecord = {
  ...basePayment,
  qrCodeUrl: null,
  authorizeUri: AUTHORIZE_URI,
  paymentMethod: 'credit_card',
  expiresAt: null,
};

describe('OrderPaymentForm', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
    navigate.mockReset();
  });

  afterEach(() => {
    sessionStorage.clear();
    resetPayment3dsAutoRedirectMemory();
  });

  it('renders QR image when qrCodeUrl is present and payment has not expired', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          expiresAt: futureExpiresAt,
        }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toHaveAttribute(
      'src',
      'https://example.com/qr.png',
    );
    expect(screen.getByText('แสกนเพื่อชำระเงินผ่านแอปธนาคารใดก็ได้')).toBeInTheDocument();
    expect(screen.queryByText('QR Code หมดอายุแล้ว กำลังอัปเดตสถานะ...')).not.toBeInTheDocument();
  });

  it('shows retry panel when pending PromptPay QR countdown has expired', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          expiresAt: pastExpiresAt,
        }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText('QR Code หมดอายุแล้ว กรุณาเลือกวิธีชำระเงินใหม่')).toBeInTheDocument();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'PromptPay QR Code' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('payment-order-not-payable')).not.toBeInTheDocument();
  });

  it('authorizeUri present → redirecting state and auto-navigates once (AC-003/004)', () => {
    render(
      <OrderPaymentForm
        payment={cardPendingPayment}
        loading={false}
        error={undefined}
        navigateToAuthorizeUri={navigate}
      />,
    );

    expect(screen.getByTestId('payment-3ds-redirecting')).toBeInTheDocument();
    expect(screen.getByText('กำลังพาไปยังหน้ายืนยันตัวตนของธนาคาร...')).toBeInTheDocument();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(AUTHORIZE_URI);
    expect(sessionStorage.getItem(threeDSAutoRedirectStorageKey(cardPendingPayment.id))).toBe(
      AUTHORIZE_URI,
    );
  });

  it('after one-shot → waiting-after-return; no second location assign (AC-012)', () => {
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(cardPendingPayment.id), AUTHORIZE_URI);

    render(
      <OrderPaymentForm
        payment={cardPendingPayment}
        loading={false}
        error={undefined}
        navigateToAuthorizeUri={navigate}
      />,
    );

    expect(screen.getByTestId('payment-waiting-after-return')).toBeInTheDocument();
    expect(screen.getByText('กำลังยืนยันการชำระเงิน...')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'เปิดหน้ายืนยันธนาคารอีกครั้ง' })).toHaveAttribute(
      'href',
      AUTHORIZE_URI,
    );
    expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('payment-paid-handoff')).not.toBeInTheDocument();
    expect(screen.queryByText('ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...')).not.toBeInTheDocument();
  });

  it('frictionless (no authorizeUri) → no location assign (AC-004)', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...cardPendingPayment,
          authorizeUri: null,
        }}
        loading={false}
        error={undefined}
        navigateToAuthorizeUri={navigate}
      />,
    );

    expect(screen.getByTestId('payment-waiting-frictionless')).toBeInTheDocument();
    expect(screen.getByText('กำลังรอการชำระเงิน...')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('empty authorizeUri → no forced redirect (empty input)', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...cardPendingPayment,
          authorizeUri: '',
        }}
        loading={false}
        error={undefined}
        navigateToAuthorizeUri={navigate}
      />,
    );

    expect(screen.getByTestId('payment-waiting-frictionless')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('PromptPay QR branch still renders when qrCodeUrl present', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          authorizeUri: AUTHORIZE_URI,
          expiresAt: futureExpiresAt,
        }}
        loading={false}
        error={undefined}
        navigateToAuthorizeUri={navigate}
      />,
    );

    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
    expect(screen.queryByTestId('payment-3ds-redirecting')).not.toBeInTheDocument();
  });

  it('shows Thai error message when payment status is failed', () => {
    render(
      <OrderPaymentForm
        payment={{ ...basePayment, status: 'failed', expiresAt: null }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText('การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')).toBeInTheDocument();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
  });

  it('shows PaymentRetryPanel when failed PromptPay payment QR has expired', () => {
    render(
      <OrderPaymentForm
        payment={{ ...basePayment, status: 'failed', expiresAt: pastExpiresAt }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText('QR Code หมดอายุแล้ว กรุณาเลือกวิธีชำระเงินใหม่')).toBeInTheDocument();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('payment-order-not-payable')).not.toBeInTheDocument();
  });

  it('shows PaymentRetryPanel when failed payment has not expired', () => {
    render(
      <OrderPaymentForm
        payment={{ ...basePayment, status: 'failed', expiresAt: futureExpiresAt }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText('การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')).toBeInTheDocument();
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
  });

  it('hides PaymentRetryPanel when paymentRecoveryUnavailable is set', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          expiresAt: futureExpiresAt,
        }}
        loading={false}
        error={undefined}
        paymentRecoveryUnavailable
      />,
    );

    expect(screen.getByTestId('payment-order-not-payable')).toBeInTheDocument();
    expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
  });

  it('shows retry message when backend is unavailable', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <OrderPaymentForm
        payment={null}
        loading={false}
        error={new Error('Network error')}
        onRetry={onRetry}
      />,
    );

    expect(
      screen.getByText('ไม่สามารถโหลดข้อมูลการชำระเงินได้ กรุณาลองใหม่อีกครั้ง'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'ลองใหม่' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('paid → thank-you handoff copy once (PaymentPaidHandoff)', () => {
    render(
      <OrderPaymentForm
        payment={{ ...basePayment, status: 'paid', orderId: CHECKOUT_ORDER_ID }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByTestId('payment-paid-handoff')).toBeInTheDocument();
    expect(screen.getByText('ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...')).toBeInTheDocument();
  });

  it('waiting-after-return CTA expands PaymentRetryPanel without createPayment navigation', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(threeDSAutoRedirectStorageKey(cardPendingPayment.id), AUTHORIZE_URI);

    render(
      <OrderPaymentForm
        payment={cardPendingPayment}
        loading={false}
        error={undefined}
        navigateToAuthorizeUri={navigate}
      />,
    );

    expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('Mid-QR live pending: CTA collapsed by default (aria-expanded=false, panel absent)', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          expiresAt: futureExpiresAt,
        }}
        loading={false}
        error={undefined}
      />,
    );

    const cta = screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' });
    expect(cta).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
  });

  it('Mid-QR expand mounts PaymentRetryPanel under QR without createPayment', async () => {
    const user = userEvent.setup();
    const onRetryPayment = vi.fn();

    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          expiresAt: futureExpiresAt,
        }}
        loading={false}
        error={undefined}
        onRetryPayment={onRetryPayment}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));

    expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'เลือกวิธีชำระเงินใหม่' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ยืนยันการชำระเงิน' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'PromptPay QR Code' })).toBeInTheDocument();
    expect(onRetryPayment).not.toHaveBeenCalled();
  });

  it('Mid-QR remount resets recoveryExpanded to collapsed', async () => {
    const user = userEvent.setup();
    const liveQrPayment = {
      ...basePayment,
      qrCodeUrl: 'https://example.com/qr.png',
      expiresAt: futureExpiresAt,
    };

    const { unmount } = render(
      <OrderPaymentForm payment={liveQrPayment} loading={false} error={undefined} />,
    );

    await user.click(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' }));
    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();

    unmount();

    render(<OrderPaymentForm payment={liveQrPayment} loading={false} error={undefined} />);

    expect(screen.getByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByTestId('payment-retry-panel')).not.toBeInTheDocument();
  });

  it('QR-expired interim shows retry panel and does not mount Mid-QR change-method CTA', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: 'https://example.com/qr.png',
          expiresAt: pastExpiresAt,
        }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByTestId('payment-retry-panel')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
    expect(screen.getByText('QR Code หมดอายุแล้ว กรุณาเลือกวิธีชำระเงินใหม่')).toBeInTheDocument();
  });

  it('frictionless pending (no qrCodeUrl) does not mount Mid-QR CTA', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...cardPendingPayment,
          authorizeUri: null,
        }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByTestId('payment-waiting-frictionless')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
  });
});
