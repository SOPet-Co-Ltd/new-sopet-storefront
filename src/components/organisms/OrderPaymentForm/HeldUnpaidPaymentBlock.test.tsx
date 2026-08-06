import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeldUnpaidPaymentBlock } from './HeldUnpaidPaymentBlock';
import { OrderPaymentForm } from './OrderPaymentForm';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

const pendingPayment = {
  id: 'pay-1',
  orderId: 'order-1',
  orderNumber: 'ORD-TEST-0001',
  amount: 100,
  currency: 'THB',
  status: 'pending' as const,
  paymentMethod: 'promptpay',
  authorizeUri: null,
  qrCodeUrl: 'https://example.com/qr.png',
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
};

describe('HeldUnpaidPaymentBlock', () => {
  it('renders payment.held.blocked Thai copy with assertive alert', () => {
    render(<HeldUnpaidPaymentBlock />);

    const block = screen.getByTestId('held-unpaid-payment-block');
    expect(block).toHaveAttribute('role', 'alert');
    expect(block).toHaveTextContent(STORE_SUSPENSION_HOLD_COPY.paymentHeldBlocked);
  });
});

describe('OrderPaymentForm held unpaid gate', () => {
  it('replaces Mid-QR / retry UI with held block when heldUnpaidBlocked', () => {
    render(
      <OrderPaymentForm
        payment={pendingPayment}
        loading={false}
        error={undefined}
        heldUnpaidBlocked
        onRetryPayment={async () => undefined}
      />,
    );

    expect(screen.getByTestId('order-payment-form-held-block')).toBeInTheDocument();
    expect(screen.getByText(STORE_SUSPENSION_HOLD_COPY.paymentHeldBlocked)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปลี่ยนวิธีชำระเงิน' })).not.toBeInTheDocument();
    expect(screen.queryByAltText(/QR/i)).not.toBeInTheDocument();
  });
});
