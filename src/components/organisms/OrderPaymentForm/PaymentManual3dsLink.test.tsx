import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PaymentManual3dsLink } from './PaymentManual3dsLink';

const ALLOWED_URI = 'https://pay.omise.co/offsites/ofsp_test/pay';
const BLOCKED_URI = 'https://evil.example/phish';

describe('PaymentManual3dsLink', () => {
  it('renders allowlisted Omise URI on links and pay button', () => {
    render(<PaymentManual3dsLink authorizeUri={ALLOWED_URI} />);

    const links = screen.getAllByRole('link');
    expect(links.every((el) => el.getAttribute('href') === ALLOWED_URI)).toBe(true);
    expect(screen.getByRole('button', { name: 'ไปชำระเงิน' })).toBeInTheDocument();
  });

  it('shows retry copy without href when URI is not allowlisted', () => {
    render(<PaymentManual3dsLink authorizeUri={BLOCKED_URI} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'ไม่สามารถเปิดลิงก์ยืนยันการชำระเงินได้อย่างปลอดภัย',
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.queryByRole('button', { name: 'ไปชำระเงิน' })).toBeNull();
  });

  it('secondary variant omits href for blocked URI', () => {
    render(<PaymentManual3dsLink authorizeUri={BLOCKED_URI} variant="secondary" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('secondary variant links allowlisted URI', () => {
    render(<PaymentManual3dsLink authorizeUri={ALLOWED_URI} variant="secondary" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', ALLOWED_URI);
  });
});
