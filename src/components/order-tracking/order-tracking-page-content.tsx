'use client';

import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import type { OrderTrackingQueryState } from '@/lib/hooks/useOrderTracking';
import { OrderShipmentTrackingList } from './order-shipment-tracking-list';
import { OrderTrackingErrorState } from './order-tracking-error-state';
import { OrderTrackingLoadingState } from './order-tracking-loading-state';
import { OrderTrackingNotFoundState } from './order-tracking-not-found-state';
import { OrderTrackingStatusHeader } from './order-tracking-status-header';

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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 md:py-12" data-order-number={orderNumber}>
      {queryState.status === 'loading' ? <OrderTrackingLoadingState /> : null}
      {queryState.status === 'not-found' ? <OrderTrackingNotFoundState /> : null}
      {queryState.status === 'error' ? <OrderTrackingErrorState onRetry={refetch} /> : null}
      {queryState.status === 'success' ? (
        <div className="space-y-6" data-testid="order-tracking-success">
          <OrderTrackingStatusHeader
            orderNumber={queryState.data.orderNumber}
            status={queryState.data.status}
            createdAt={queryState.data.createdAt}
          />
          <OrderShipmentTrackingList items={queryState.data.items} />
          <OrderConfirmationSummary order={queryState.data} hideHeader />
        </div>
      ) : null}
    </div>
  );
}
