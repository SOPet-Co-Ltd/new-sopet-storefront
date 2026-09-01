import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ErrorMessagesPage } from '@/components/pages/ErrorMessagesPage';
import { ERROR_CATALOG } from '@/lib/errors/errorMessages';

describe('ErrorMessagesPage', () => {
  it('renders title, search, group filters, and catalog entries', () => {
    render(<ErrorMessagesPage />);

    expect(screen.getByTestId('error-messages-page')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'รหัสข้อผิดพลาด' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'ค้นหารหัสข้อผิดพลาด' })).toBeInTheDocument();
    expect(screen.getByTestId('error-catalog-group-filters')).toBeInTheDocument();
    expect(screen.getByText(`${ERROR_CATALOG.length} รหัสข้อผิดพลาด`)).toBeInTheDocument();
    expect(screen.getByTestId('error-catalog-entry-INVALID_OTP')).toBeInTheDocument();
  });

  it('uses a full-bleed sticky toolbar with edge-to-edge border', () => {
    render(<ErrorMessagesPage />);

    const toolbar = screen.getByTestId('error-catalog-sticky-toolbar');
    expect(toolbar.className).toMatch(/sticky/);
    expect(toolbar.className).toMatch(/bg-sop-primary-100/);
    expect(toolbar.className).not.toMatch(/bg-sop-base-white/);
    expect(toolbar.className).toMatch(/border-b/);
    expect(toolbar.className).toMatch(/border-sop-neutral-grayalpha-200/);
    expect(toolbar.className).toMatch(/backdrop-blur/);
    // Sticks below the fixed site header, not under it at top-0
    expect(toolbar.className).toMatch(/top-\[calc\(6\.3125rem/);
    expect(toolbar).toContainElement(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสข้อผิดพลาด' }),
    );
    expect(toolbar).toContainElement(screen.getByTestId('error-catalog-group-filters'));
  });

  it('keeps docs collapsed by default and expands on click', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesPage />);

    const otpEntry = screen.getByTestId('error-catalog-entry-INVALID_OTP');
    const details = otpEntry.querySelector('details');
    expect(details).toBeTruthy();
    expect(details).not.toHaveAttribute('open');
    expect(within(otpEntry).queryByText('สาเหตุ')).not.toBeVisible();

    await user.click(within(otpEntry).getByLabelText('ดูรายละเอียด INVALID_OTP'));

    expect(details).toHaveAttribute('open');
    expect(within(otpEntry).getByText('สาเหตุ')).toBeVisible();
    expect(within(otpEntry).getByText('ปัญหาที่เป็นไปได้')).toBeVisible();
    expect(within(otpEntry).getByText('วิธีแก้ไข')).toBeVisible();
  });

  it('hides expand control when an entry has no docs', () => {
    render(<ErrorMessagesPage />);

    const obscure = ERROR_CATALOG.find(
      (entry) => !entry.why && !entry.possibleIssue && !entry.howToFix,
    );
    expect(obscure).toBeDefined();
    const obscureRow = screen.getByTestId(`error-catalog-entry-${obscure!.code}`);
    expect(obscureRow.querySelector('details')).toBeNull();
    expect(within(obscureRow).queryByLabelText(/ดูรายละเอียด/)).not.toBeInTheDocument();
  });

  it('filters entries as the user types', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesPage />);

    const search = screen.getByRole('searchbox', { name: 'ค้นหารหัสข้อผิดพลาด' });
    await user.type(search, 'ORDER_NOT_PAYABLE');

    expect(screen.getByTestId('error-catalog-entry-ORDER_NOT_PAYABLE')).toBeInTheDocument();
    expect(screen.queryByTestId('error-catalog-entry-INVALID_OTP')).not.toBeInTheDocument();
    expect(screen.getByText(/พบ 1 จาก/)).toBeInTheDocument();
  });

  it('filters by group chip', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesPage />);

    await user.click(screen.getByTestId('error-catalog-group-Auth'));

    expect(screen.getByTestId('error-catalog-entry-INVALID_OTP')).toBeInTheDocument();
    expect(screen.queryByTestId('error-catalog-entry-ORDER_NOT_PAYABLE')).not.toBeInTheDocument();
    expect(screen.getByText(/พบ \d+ จาก/)).toBeInTheDocument();
  });

  it('shows empty state when no codes match and clears filters', async () => {
    const user = userEvent.setup();
    render(<ErrorMessagesPage />);

    await user.type(
      screen.getByRole('searchbox', { name: 'ค้นหารหัสข้อผิดพลาด' }),
      'no-such-error-code-xyz',
    );

    expect(screen.getByTestId('error-catalog-empty')).toBeInTheDocument();
    expect(screen.getByText(/ไม่พบรหัสข้อผิดพลาด/)).toBeInTheDocument();

    await user.click(screen.getByTestId('error-catalog-clear-filters'));

    expect(screen.queryByTestId('error-catalog-empty')).not.toBeInTheDocument();
    expect(screen.getByTestId('error-catalog-entry-INVALID_OTP')).toBeInTheDocument();
  });
});
