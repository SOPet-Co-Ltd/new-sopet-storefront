'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { AccountTabBar } from '@/components/molecules/account/AccountTabBar';
import { Pagination } from '@/components/molecules/Pagination';
import { OrderListItem } from '@/components/molecules/OrderListItem/OrderListItem';
import {
  getOrderListEmptyMessage,
  ORDER_LIST_FILTERS,
  ORDERS_PAGE_SIZE,
  parseOrderListFilter,
  parseOrdersPage,
  type OrderListFilterId,
} from '@/lib/constants/orderListFilters';
import { useOrders } from '@/lib/hooks/useOrders';
import { useOrdersReviewStatus } from '@/lib/hooks/useOrdersReviewStatus';
import { saveOrdersListReturnUrl } from '@/lib/orders/orderListReturnUrl';

export default function UserOrdersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filter = parseOrderListFilter(searchParams.get('filter'));
  const page = parseOrdersPage(searchParams.get('page'));

  const { orders, loading, pagination, refetch } = useOrders({
    page,
    limit: ORDERS_PAGE_SIZE,
    filter,
  });
  const { isOrderFullyReviewed } = useOrdersReviewStatus(orders);

  useEffect(() => {
    const query = searchParams.toString();
    saveOrdersListReturnUrl(query ? `${pathname}?${query}` : pathname);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetch]);

  const updateSearchParams = useCallback(
    (updates: { page?: number; filter?: OrderListFilterId }) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextFilter = updates.filter ?? filter;
      const nextPage = updates.page ?? (updates.filter !== undefined ? 1 : page);

      if (nextFilter === 'ALL') {
        params.delete('filter');
      } else {
        params.set('filter', nextFilter);
      }

      if (nextPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(nextPage));
      }

      const query = params.toString();
      router.push(query ? `/user/orders?${query}` : '/user/orders');
    },
    [router, searchParams, filter, page],
  );

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <AccountLayout title="คำสั่งซื้อสินค้า">
      <section className="space-y-4">
        <AccountTabBar
          ariaLabel="ตัวกรองคำสั่งซื้อ"
          onValueChange={(value) =>
            updateSearchParams({ filter: value as OrderListFilterId, page: 1 })
          }
          tabs={ORDER_LIST_FILTERS.map(({ id, label }) => ({ id, label }))}
          value={filter}
        />

        {loading ? (
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
        ) : orders.length === 0 ? (
          <AccountCard padding="lg">
            <AccountEmptyState message={getOrderListEmptyMessage(filter)} />
          </AccountCard>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderListItem
                key={order.id}
                order={order}
                showReviewedTag={isOrderFullyReviewed(order.id, order.status)}
              />
            ))}
          </div>
        )}

        {!loading && totalPages > 1 ? (
          <div className="flex justify-center pt-2">
            <Pagination
              currentPage={page}
              disabled={loading}
              onPageChange={(nextPage) => updateSearchParams({ page: nextPage })}
              totalPages={totalPages}
            />
          </div>
        ) : null}
      </section>
    </AccountLayout>
  );
}
