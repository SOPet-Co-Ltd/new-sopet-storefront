'use client';

import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';

export default function UserReviewsPage() {
  return (
    <AccountLayout title="รีวิวสินค้า">
      <div className="space-y-4">
        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-8 text-center">
          <p className="sop-body-md-medium text-sop-neutral-gray-200">รีวิวที่รอดำเนินการ</p>
          <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-400">
            ยังไม่มีสินค้าที่รอให้รีวิว
          </p>
        </div>
        <Link
          href="/user/reviews/written"
          className="inline-block sop-body-sm-medium text-sop-secondary-500 underline"
        >
          ดูรีวิวที่เขียนแล้ว
        </Link>
      </div>
    </AccountLayout>
  );
}
