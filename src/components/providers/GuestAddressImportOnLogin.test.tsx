import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { GuestAddressImportOnLogin } from '@/components/providers/GuestAddressImportOnLogin';

const { mockImport, mockUseAuth, mockUseAddresses } = vi.hoisted(() => ({
  mockImport: vi.fn().mockResolvedValue('imported'),
  mockUseAuth: vi.fn(),
  mockUseAddresses: vi.fn(),
}));

vi.mock('@/lib/checkout/importRememberedGuestAddress', () => ({
  importRememberedGuestAddress: mockImport,
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/lib/hooks/useAddresses', () => ({
  useAddresses: mockUseAddresses,
}));

describe('GuestAddressImportOnLogin', () => {
  const createAddress = vi.fn();

  beforeEach(() => {
    mockImport.mockReset();
    mockImport.mockResolvedValue('imported');
    createAddress.mockReset();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      customer: { phone: '0812345678' },
    });
    mockUseAddresses.mockReturnValue({
      addresses: [],
      loading: false,
      createAddress,
    });
  });

  it('imports remembered address once when logged in', async () => {
    render(<GuestAddressImportOnLogin />);

    await waitFor(() => {
      expect(mockImport).toHaveBeenCalledTimes(1);
    });
    expect(mockImport).toHaveBeenCalledWith({
      accountPhone: '0812345678',
      addresses: [],
      createAddress,
    });
  });

  it('does not import when anonymous', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      customer: null,
    });

    render(<GuestAddressImportOnLogin />);

    await waitFor(() => {
      expect(mockImport).not.toHaveBeenCalled();
    });
  });

  it('waits until addresses finish loading', async () => {
    mockUseAddresses.mockReturnValue({
      addresses: [],
      loading: true,
      createAddress,
    });

    const { rerender } = render(<GuestAddressImportOnLogin />);
    expect(mockImport).not.toHaveBeenCalled();

    mockUseAddresses.mockReturnValue({
      addresses: [],
      loading: false,
      createAddress,
    });
    rerender(<GuestAddressImportOnLogin />);

    await waitFor(() => {
      expect(mockImport).toHaveBeenCalledTimes(1);
    });
  });
});
