import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UserAddressesPage from './page';
import { sampleSavedAddress, sampleSavedAddress2 } from '@/test/mocks/fixtures/checkout';

vi.mock('@/lib/hooks/useAddresses', () => ({
  useAddresses: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/addresses',
  useRouter: () => ({ prefetch: vi.fn() }),
}));

import { useAddresses } from '@/lib/hooks/useAddresses';

const mockedUseAddresses = vi.mocked(useAddresses);

describe('UserAddressesPage', () => {
  it('renders AccountEmptyState when addresses list is empty', () => {
    mockedUseAddresses.mockReturnValue({
      addresses: [],
      loading: false,
      deleteAddress: vi.fn(),
      setDefaultAddress: vi.fn(),
    } as ReturnType<typeof useAddresses>);

    render(<UserAddressesPage />);

    expect(screen.getByTestId('account-empty-state')).toBeInTheDocument();
    expect(screen.getByText('ยังไม่มีที่อยู่จัดส่ง')).toBeInTheDocument();
  });

  it('renders plain-text loading state', () => {
    mockedUseAddresses.mockReturnValue({
      addresses: [],
      loading: true,
      deleteAddress: vi.fn(),
      setDefaultAddress: vi.fn(),
    } as ReturnType<typeof useAddresses>);

    render(<UserAddressesPage />);

    expect(screen.getByText('กำลังโหลด...')).toBeInTheDocument();
    expect(screen.queryByTestId('address-card')).not.toBeInTheDocument();
  });

  it('renders populated address cards with formatted content', () => {
    mockedUseAddresses.mockReturnValue({
      addresses: [sampleSavedAddress, sampleSavedAddress2],
      loading: false,
      deleteAddress: vi.fn(),
      setDefaultAddress: vi.fn(),
    } as ReturnType<typeof useAddresses>);

    render(<UserAddressesPage />);

    expect(screen.getAllByTestId('address-card')).toHaveLength(2);
    expect(screen.getByTestId('address-default-badge')).toBeInTheDocument();
    expect(screen.getByText('สมชาย ใจดี (081-234-5678)')).toBeInTheDocument();
    expect(
      screen.getByText('123 ถนนสุขุมวิท คลองตัน วัฒนา กรุงเทพมหานคร 10110'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('address-card-set-default-button')).toBeInTheDocument();
  });

  it('confirms before delete and couples action loading to both buttons', async () => {
    const user = userEvent.setup();
    const deleteAddress = vi.fn().mockResolvedValue(true);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    mockedUseAddresses.mockReturnValue({
      addresses: [sampleSavedAddress2],
      loading: false,
      deleteAddress,
      setDefaultAddress: vi.fn(),
    } as ReturnType<typeof useAddresses>);

    render(<UserAddressesPage />);

    await user.click(screen.getByTestId('address-card-delete-button'));

    expect(confirmSpy).toHaveBeenCalledWith('ต้องการลบที่อยู่นี้หรือไม่?');
    expect(deleteAddress).toHaveBeenCalledWith('addr-2');

    confirmSpy.mockRestore();
  });
});
