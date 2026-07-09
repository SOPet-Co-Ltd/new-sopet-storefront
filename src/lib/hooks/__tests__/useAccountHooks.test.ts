import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApolloTestWrapper } from '@/test/createApolloTestWrapper';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { useOrders } from '@/lib/hooks/useOrders';
import { useProfile } from '@/lib/hooks/useProfile';
import { sampleOrder } from '@/test/mocks/fixtures/checkout';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('@/lib/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

const createWrapper = createApolloTestWrapper;

afterEach(() => {
  mockUseAuth.mockReset();
});

describe('Phase 4 account hooks', () => {
  it('useOrders returns empty list when anonymous', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });

    const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.orders).toEqual([]);
  });

  it('useOrders returns order history when authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const { result } = renderHook(() => useOrders(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.orders[0]?.orderNumber).toBe(sampleOrder.orderNumber);
    });
  });

  it('useFavorites returns favorites when authenticated', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.favorites[0]?.productId).toBe('prod-1');
    });

    expect(result.current.isFavorite('prod-1')).toBe(true);
  });

  it('useProfile updates profile via mutation', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper: createWrapper() });

    const updated = await result.current.updateProfile({ fullName: 'สมชาย ใจดี' });

    expect(updated?.fullName).toBe('สมชาย ใจดี');
  });
});
