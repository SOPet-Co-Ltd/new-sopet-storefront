'use client';

import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';

export default function WrittenReviewsPage() {
  return (
    <AccountLayout title="รีวิวที่เขียนแล้ว">
      <div className="space-y-4">
        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-8 text-center">
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">
            ยังไม่มีรีวิวที่เขียนแล้ว
          </p>
        </div>
        <Link
          href="/user/reviews"
          className="inline-block sop-body-sm-medium text-sop-secondary-500 underline"
        >
          กลับไปรีวิวที่รอดำเนินการ
        </Link>
      </div>
    </AccountLayout>
  );
}
