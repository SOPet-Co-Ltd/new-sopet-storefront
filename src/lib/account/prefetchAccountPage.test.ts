import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  __resetAccountPrefetchStateForTests,
  prefetchAccountPage,
  prefetchAllAccountPages,
  prefetchOrderDetail,
} from './prefetchAccountPage';

const { mockQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(() => Promise.resolve({ data: {} })),
}));

vi.mock('@/lib/graphql/client', () => ({
  getApolloClient: () => ({
    query: mockQuery,
  }),
}));

afterEach(() => {
  mockQuery.mockClear();
  __resetAccountPrefetchStateForTests();
});

describe('prefetchAccountPage', () => {
  it('prefetches GraphQL data for orders route once', () => {
    prefetchAccountPage('/user/orders');
    prefetchAccountPage('/user/orders');

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: 'cache-first',
      }),
    );
  });

  it('prefetches both review tabs for reviews route', () => {
    prefetchAccountPage('/user/reviews');

    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('skips profile and delete routes', () => {
    prefetchAccountPage('/user/profile');
    prefetchAccountPage('/user/delete');

    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('prefetches order detail by id', () => {
    prefetchOrderDetail('order-123');
    prefetchOrderDetail('order-123');

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: 'order-123' },
        fetchPolicy: 'cache-first',
      }),
    );
  });

  it('warms all account list routes', () => {
    prefetchAllAccountPages();

    expect(mockQuery).toHaveBeenCalledTimes(8);
  });
});
