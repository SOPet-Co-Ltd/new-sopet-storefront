'use client';

import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { CheckIcon } from '@/components/atoms/icons';
import { OrderConfirmationSummary } from '@/components/organisms/OrderConfirmationSummary';
import { OrderDocument } from '@/lib/graphql/generated/graphql';

type OrderConfirmedContentProps = {
  orderId: string;
};

export function OrderConfirmedContent({ orderId }: OrderConfirmedContentProps) {
  const { data, loading, error } = useQuery(OrderDocument, {
    variables: { id: orderId },
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return (
      <main className="min-h-dvh bg-sop-primary-100 px-4 py-12">
        <div className="mx-auto max-w-3xl animate-pulse space-y-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-sop-neutral-grayalpha-200" />
          <div className="h-8 rounded-sop-12px bg-sop-neutral-grayalpha-200" />
          <div className="h-64 rounded-sop-24px bg-sop-neutral-grayalpha-200" />
        </div>
      </main>
    );
  }

  if (error || !data?.order) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-sop-primary-100 px-4 py-12 text-center">
        <h1 className="mb-3 sop-headline-sm-medium text-sop-neutral-gray-200">ไม่พบข้อมูลคำสั่งซื้อ</h1>
        <p className="mb-6 sop-body-sm-regular text-sop-neutral-gray-400">
          อาจเกิดจากลิงก์หมดอายุ หรือเกิดข้อผิดพลาดในการโหลดข้อมูล
        </p>
        <Link href="/" className="sop-body-sm-medium text-sop-primary-500 hover:underline">
          กลับหน้าหลัก
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-sop-primary-100 px-4 py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-sop-additionalgreen-500"
            role="img"
            aria-label="ไอคอนเครื่องหมายถูก"
          >
            <CheckIcon size={{ mobile: 30 }} color="#FFFFFF" />
          </div>
          <div>
            <h1 className="sop-headline-sm-medium text-sop-neutral-gray-200">การสั่งซื้อสำเร็จ</h1>
            <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-400">
              ขอบคุณที่ไว้วางใจ Sopet เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว
            </p>
          </div>
        </div>

        <OrderConfirmationSummary order={data.order} />

        <Link
          href={`/thank-you/${orderId}`}
          className="sop-body-sm-medium text-sop-primary-500 hover:underline"
        >
          ไปหน้าขอบคุณ
        </Link>
      </div>
    </main>
  );
}
