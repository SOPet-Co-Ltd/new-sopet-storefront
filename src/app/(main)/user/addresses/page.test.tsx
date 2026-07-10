import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UserAddressesPage from './page';

vi.mock('@/lib/hooks/useAddresses', () => ({
  useAddresses: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/user/addresses',
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
});
