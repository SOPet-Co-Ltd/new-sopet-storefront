'use client';

import type { OrderTrackingQueryState } from '@/lib/hooks/useOrderTracking';
import { OrderTrackingErrorState } from './order-tracking-error-state';
import { OrderTrackingLoadingState } from './order-tracking-loading-state';
import { OrderTrackingNotFoundState } from './order-tracking-not-found-state';
import { OrderTrackingSuccessCard } from './order-tracking-success-card';

type OrderTrackingPageContentProps = {
  orderNumber: string;
  queryState: OrderTrackingQueryState;
  refetch: () => void;
};

export function OrderTrackingPageContent({
  orderNumber,
  queryState,
  refetch,
}: OrderTrackingPageContentProps) {
  return (
    <div
      className="mx-auto min-h-dvh max-w-5xl space-y-6 px-4 py-8 md:py-12"
      data-order-number={orderNumber}
    >
      {queryState.status === 'loading' ? <OrderTrackingLoadingState /> : null}
      {queryState.status === 'not-found' ? <OrderTrackingNotFoundState /> : null}
      {queryState.status === 'error' ? <OrderTrackingErrorState onRetry={refetch} /> : null}
      {queryState.status === 'success' ? (
        <OrderTrackingSuccessCard
          order={queryState.data}
          status={queryState.data.status}
          items={queryState.data.items}
        />
      ) : null}
    </div>
  );
}
