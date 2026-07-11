'use client';

import { useParams } from 'next/navigation';
import { OrderTrackingPageContent } from '@/components/order-tracking/order-tracking-page-content';
import { useOrderTracking } from '@/lib/hooks/useOrderTracking';

export default function OrderTrackingPage() {
  const params = useParams<{ orderNumber: string }>();
  const { orderNumber, queryState, refetch } = useOrderTracking(params.orderNumber);

  return (
    <OrderTrackingPageContent orderNumber={orderNumber} queryState={queryState} refetch={refetch} />
  );
}
