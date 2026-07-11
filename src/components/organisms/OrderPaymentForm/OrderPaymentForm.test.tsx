import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OrderPaymentForm } from '@/components/organisms/OrderPaymentForm/OrderPaymentForm';
import type { PaymentRecord } from '@/lib/hooks/usePayment';
import { CHECKOUT_ORDER_ID, samplePendingPayment } from '@/test/mocks/fixtures/checkout';

const basePayment: PaymentRecord = samplePendingPayment;
const futureExpiresAt = '2030-01-01T00:00:00.000Z';
const pastExpiresAt = '2020-01-01T00:00:00.000Z';

describe('OrderPaymentForm', () => {
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

  it('shows updating message when pending PromptPay QR countdown has expired', () => {
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

    expect(screen.getByText('QR Code หมดอายุแล้ว กำลังอัปเดตสถานะ...')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'PromptPay QR Code' })).not.toBeInTheDocument();
  });

  it('shows redirect link when authorizeUri is present', () => {
    render(
      <OrderPaymentForm
        payment={{
          ...basePayment,
          qrCodeUrl: null,
          authorizeUri: 'https://example.com/pay',
          paymentMethod: 'card',
        }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByRole('link', { name: 'เปิดลิงก์ชำระเงิน' })).toHaveAttribute(
      'href',
      'https://example.com/pay',
    );
    expect(screen.getByRole('button', { name: 'ไปชำระเงิน' })).toBeInTheDocument();
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
  });

  it('shows QR expired message when failed PromptPay payment had expiresAt', () => {
    render(
      <OrderPaymentForm
        payment={{ ...basePayment, status: 'failed' }}
        loading={false}
        error={undefined}
      />,
    );

    expect(
      screen.getByText('QR Code หมดอายุแล้ว กรุณาทำรายการใหม่จากหน้าชำระเงิน'),
    ).toBeInTheDocument();
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

  it('shows redirecting state when payment is paid', () => {
    render(
      <OrderPaymentForm
        payment={{ ...basePayment, status: 'paid', orderId: CHECKOUT_ORDER_ID }}
        loading={false}
        error={undefined}
      />,
    );

    expect(screen.getByText('ชำระเงินสำเร็จ กำลังเปลี่ยนหน้า...')).toBeInTheDocument();
  });
});
