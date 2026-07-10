import { describe, expect, it, vi } from 'vitest';
import { invalidateCustomerOrders } from './invalidateCustomerOrders';

const mockRefetchQueries = vi.fn();

vi.mock('@/lib/graphql/client', () => ({
  getApolloClient: () => ({
    refetchQueries: mockRefetchQueries,
  }),
}));

describe('invalidateCustomerOrders', () => {
  it('refetches orders and order detail queries', async () => {
    mockRefetchQueries.mockResolvedValue(undefined);

    await invalidateCustomerOrders();

    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: expect.arrayContaining([
        expect.objectContaining({ kind: 'Document' }),
        expect.objectContaining({ kind: 'Document' }),
      ]),
    });
  });
});
