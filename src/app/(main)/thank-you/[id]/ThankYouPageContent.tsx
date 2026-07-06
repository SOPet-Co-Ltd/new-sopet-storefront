'use client';

import { useQuery } from '@apollo/client/react';
import { CheckIcon } from '@/components/atoms/icons';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import { ThankYouAction } from '@/components/organisms/ThankYouAction';
import ThankYouPageCopyId from '@/components/organisms/ThankYouPageCopyId';
import ThankYouRecommendedProductSection from '@/components/organisms/ThankYouRecommendedProductSection';
import { OrderDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ThankYouPageContentProps = {
  orderId: string;
};

export function ThankYouPageContent({ orderId }: ThankYouPageContentProps) {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery(OrderDocument, {
    variables: { id: orderId },
    fetchPolicy: 'network-only',
  });

  const isGuest = !isAuthenticated;
  const order = data?.order;

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
              <span className="sop-body-lg-medium text-sop-secondary-500">
                {order?.orderNumber ?? orderId}
              </span>
              <ThankYouPageCopyId id={order?.orderNumber ?? orderId} />
            </div>
            <p className="sop-body-md-regular text-sop-neutral-gray-300">
              เราได้รับข้อมูลคำสั่งซื้อของคุณเรียบร้อยแล้ว
            </p>
          </div>
          <ThankYouAction isGuest={isGuest} orderId={orderId} />
        </div>
      </section>

      {order ? (
        <section className="mb-20 px-4 md:px-20" aria-label="สรุปคำสั่งซื้อ">
          <div className="mx-auto max-w-3xl">
            <OrderConfirmationSummary order={order} />
          </div>
        </section>
      ) : null}

      <section
        className="w-full md:px-20 px-4 md:py-0 py-4 mb-20"
        aria-label="สินค้าแนะนำ"
      >
        <ThankYouRecommendedProductSection />
      </section>
    </main>
  );
}
