'use client';

import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { AccountStatusBadge } from '@/components/molecules/account/AccountStatusBadge';
import { useDisputes } from '@/lib/hooks/useDisputes';

const DISPUTE_STATUS_LABELS: Record<string, string> = {
  open: 'เปิดอยู่',
  in_review: 'กำลังตรวจสอบ',
  resolved: 'แก้ไขแล้ว',
  rejected: 'ปฏิเสธ',
  closed: 'ปิดแล้ว',
};

const ISSUE_TYPE_LABELS: Record<string, string> = {
  not_received: 'ยังไม่ได้รับสินค้า',
  wrong_item: 'สินค้าไม่ตรงตามที่สั่ง',
  damaged: 'สินค้าชำรุด/เสียหาย',
  other: 'อื่นๆ',
};

export default function UserReturnsPage() {
  const { disputes, loading } = useDisputes();

  return (
    <AccountLayout title="คำขอคืนสินค้า">
      {loading ? (
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>
      ) : disputes.length === 0 ? (
        <AccountCard padding="lg">
          <AccountEmptyState
            cta={{ href: '/user/orders', label: 'ดูคำสั่งซื้อ' }}
            message="ยังไม่มีคำขอคืนสินค้า"
          />
        </AccountCard>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <AccountCard key={dispute.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="sop-body-sm-medium text-sop-neutral-gray-200">
                    {ISSUE_TYPE_LABELS[dispute.issueType] ?? dispute.issueType}
                  </p>
                  <p className="mt-1 sop-body-xs-regular text-sop-neutral-gray-400">
                    {new Date(dispute.createdAt).toLocaleString('th-TH')}
                  </p>
                </div>
                <AccountStatusBadge>
                  {DISPUTE_STATUS_LABELS[dispute.status] ?? dispute.status}
                </AccountStatusBadge>
              </div>
              <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-300">{dispute.reason}</p>
              <Link
                href={`/user/orders/${dispute.orderId}`}
                className="mt-2 inline-block sop-body-sm-medium text-sop-secondary-500 underline"
              >
                ดูคำสั่งซื้อ
              </Link>
            </AccountCard>
          ))}
        </div>
      )}
    </AccountLayout>
  );
}
