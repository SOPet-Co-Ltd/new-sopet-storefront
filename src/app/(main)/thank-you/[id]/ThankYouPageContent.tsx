'use client';

import { useQuery } from '@apollo/client/react';
import { useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@/components/atoms/icons';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import { ThankYouAction } from '@/components/organisms/ThankYouAction';
import ThankYouPageCopyId from '@/components/organisms/ThankYouPageCopyId';
import ThankYouRecommendedProductSection from '@/components/organisms/ThankYouRecommendedProductSection';
import { orderLineToAnalyticsItem, trackPurchase } from '@/lib/analytics';
import { getPendingCheckout } from '@/lib/checkout/pendingCheckout';
import { OrderDocument, PaymentByOrderIdDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ThankYouPageContentProps = {
  orderId: string;
};

/** Human-facing order codes only (never raw UUID / payment ids from the route). */
export function isCustomerFacingOrderNumber(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^ORD-/i.test(value.trim());
}

function resolveCustomerFacingOrderNumber(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    if (isCustomerFacingOrderNumber(candidate)) {
      return candidate.trim();
    }
  }
  return null;
}

export function ThankYouPageContent({ orderId }: ThankYouPageContentProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const purchaseTrackedRef = useRef<string | null>(null);
  const [pendingOrderNumber] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const pending = getPendingCheckout();
    if (pending?.orderId !== orderId) {
      return null;
    }
    return resolveCustomerFacingOrderNumber(pending.orderNumber);
  });

  const isGuest = !isAuthenticated;
  // Wait for auth bootstrap so we do not fire the customer-scoped `order` query as a
  // guest (UNAUTHENTICATED → auth error link → logout side effects).
  const authReady = !isAuthLoading;

  const { data, loading: orderLoading } = useQuery(OrderDocument, {
    variables: { id: orderId },
    fetchPolicy: 'network-only',
    skip: !authReady || !isAuthenticated,
  });

  // Public payment lookup is the guest (and fallback) source of ORD-… numbers.
  const { data: paymentData, loading: paymentLoading } = useQuery(PaymentByOrderIdDocument, {
    variables: { orderId },
    fetchPolicy: 'network-only',
    skip: !authReady,
  });

  const order = data?.order;
  const orderNumber = resolveCustomerFacingOrderNumber(
    order?.orderNumber,
    paymentData?.paymentByOrderId?.orderNumber,
    pendingOrderNumber,
  );
  const isOrderNumberLoading =
    !orderNumber && (!authReady || orderLoading || paymentLoading);

  useEffect(() => {
    if (!order?.id || purchaseTrackedRef.current === order.id) {
      return;
    }
    purchaseTrackedRef.current = order.id;

    const items = (order.items ?? []).map(orderLineToAnalyticsItem);
    trackPurchase({
      transaction_id: order.orderNumber ?? order.id,
      value: order.total,
      shipping: order.shippingFee ?? undefined,
      items,
    });
  }, [order]);

  return (
    <main className="min-h-dvh flex flex-col bg-sop-primary-100">
      <section
        className="h-[400px] bg-sop-primary-500 overflow-hidden relative"
        aria-label="ภาพประกอบหน้าขอบคุณ"
      >
        <Image
          src="/images/thank-you/sop-thankyou-effect-1.webp"
          alt=""
          aria-hidden="true"
          width={204}
          height={384}
          className={cn(
            'absolute object-cover w-[204px] h-[384px]',
            'top-sop-80px md:top-sop-24px',
            'left-sop-20px',
            'md:left-[120px]',
          )}
        />

        <Image
          src="/images/thank-you/sop-thankyou-effect-2.webp"
          alt=""
          aria-hidden="true"
          width={204}
          height={384}
          className={cn(
            'absolute object-cover w-[204px] h-[384px]',
            'top-sop-80px md:top-sop-24px',
            'right-sop-20px',
            'md:right-[120px]',
          )}
        />

        <Image
          src="/images/thank-you/sop-thankyou-text.webp"
          alt="ข้อความขอบคุณ"
          width={228}
          height={58}
          className="w-[228px] h-auto object-cover absolute left-1/2 -translate-x-1/2 top-sop-80px md:top-sop-24px"
          style={{ height: '64px' }}
        />
        <div
          aria-hidden="true"
          className="w-[6600px] bg-sop-primary-100 aspect-square rounded-full overflow-hidden absolute left-1/2 -translate-x-1/2 top-[312px]"
        />
        <Image
          src="/images/thank-you/sop-thankyou-dog.webp"
          alt="ภาพประกอบสุนัข"
          width={660}
          height={290}
          className="object-cover absolute left-1/2 -translate-x-1/2 w-[560px] h-[190px] bottom-sop-32px md:w-[660px] md:h-[290px] md:bottom-sop-20px"
        />
      </section>

      <section className="mb-20" aria-labelledby="order-confirmation-title">
        <div className="w-full flex flex-col justify-center items-center gap-5 px-4">
          <div
            className="flex items-center justify-center aspect-square bg-sop-additionalgreen-500 w-sop-80px h-sop-80px rounded-full"
            role="img"
            aria-label="ไอคอนเครื่องหมายถูก"
          >
            <CheckIcon size={{ mobile: 30 }} color="#FFFFFF" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <h1
              id="order-confirmation-title"
              className="sop-body-lg-medium text-sop-neutral-gray-200"
            >
              ขอบคุณสำหรับคำสั่งซื้อ
            </h1>
            <div className="flex items-center justify-center gap-1">
              <span className="sop-body-lg-medium text-sop-neutral-gray-200">
                รหัสคำสั่งซื้อ :{' '}
              </span>
              {orderNumber ? (
                <>
                  <span
                    className="sop-body-lg-medium text-sop-secondary-500"
                    data-testid="thank-you-order-number"
                  >
                    {orderNumber}
                  </span>
                  <ThankYouPageCopyId id={orderNumber} />
                </>
              ) : (
                <span
                  className={cn(
                    'inline-block h-7 min-w-[160px] rounded-sop-8 bg-sop-neutral-grayalpha-200',
                    isOrderNumberLoading && 'animate-pulse',
                  )}
                  aria-busy={isOrderNumberLoading}
                  aria-label={
                    isOrderNumberLoading ? 'กำลังโหลดรหัสคำสั่งซื้อ' : 'ไม่พบรหัสคำสั่งซื้อ'
                  }
                  data-testid="thank-you-order-number-pending"
                />
              )}
            </div>
            <p className="sop-body-md-regular text-sop-neutral-gray-300">
              เราได้รับข้อมูลคำสั่งซื้อของคุณเรียบร้อยแล้ว
            </p>
          </div>
          <ThankYouAction isGuest={isGuest} orderNumber={orderNumber ?? ''} />
        </div>
      </section>

      {order ? (
        <section className="mb-20 px-4 md:px-20" aria-label="สรุปคำสั่งซื้อ">
          <div className="mx-auto max-w-3xl">
            <OrderConfirmationSummary order={order} />
          </div>
        </section>
      ) : null}

      <section className="w-full md:px-20 px-4 md:py-0 py-4 mb-20" aria-label="สินค้าแนะนำ">
        <ThankYouRecommendedProductSection />
      </section>
    </main>
  );
}
