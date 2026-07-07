'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';

export default function ReturnRequestSuccessPage() {
  const params = useParams<{ id: string }>();

  return (
    <AccountLayout title="ส่งคำขอสำเร็จ">
      <div className="max-w-lg rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-8 text-center">
        <p className="sop-body-lg-medium text-sop-system-success-500">ส่งคำขอคืนสินค้าเรียบร้อยแล้ว</p>
        <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-400">
          ทีมงานจะตรวจสอบและติดต่อกลับโดยเร็วที่สุด
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={`/user/orders/${params.id}`}>
            <Button variant="outline" fill>
              ดูคำสั่งซื้อ
            </Button>
          </Link>
          <Link href="/user/returns">
            <Button fill>ดูคำขอคืนสินค้า</Button>
          </Link>
        </div>
      </div>
    </AccountLayout>
  );
}
