'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountBackLink } from '@/components/molecules/account/AccountBackLink';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { Button } from '@/components/atoms/Button';
import { useDisputes } from '@/lib/hooks/useDisputes';

const ISSUE_TYPES = [
  { value: 'not_received', label: 'ยังไม่ได้รับสินค้า' },
  { value: 'wrong_item', label: 'ได้รับสินค้าไม่ตรงตามที่สั่ง' },
  { value: 'damaged', label: 'สินค้าชำรุด/เสียหาย' },
  { value: 'other', label: 'อื่นๆ' },
] as const;

export default function CreateReturnPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { createDispute, creating } = useDisputes();
  const [issueType, setIssueType] = useState<string>('not_received');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!params.id) return;

    if (!reason.trim()) {
      setError('กรุณาระบุเหตุผลในการขอคืนสินค้า');
      return;
    }

    try {
      setError(null);
      await createDispute({
        orderId: params.id,
        issueType,
        reason: reason.trim(),
      });
      router.push(`/user/orders/${params.id}/request-success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถส่งคำขอได้');
    }
  };

  return (
    <AccountLayout title="ขอคืนสินค้า">
      <div className="space-y-4">
        <AccountBackLink
          href={`/user/orders/${params.id}`}
          label="กลับไปรายละเอียดคำสั่งซื้อ"
        />
        <AccountCard padding="md" className="w-full">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <p className="mb-2 sop-body-sm-medium text-sop-neutral-gray-200">ประเภทปัญหา</p>
          <div className="space-y-2">
            {ISSUE_TYPES.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-sop-8px border border-sop-neutral-grayalpha-200 px-4 py-3 sop-body-sm-regular text-sop-neutral-gray-300"
              >
                <input
                  type="radio"
                  name="issueType"
                  value={option.value}
                  checked={issueType === option.value}
                  onChange={() => setIssueType(option.value)}
                  className="accent-sop-primary-500"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="mb-2 block sop-body-sm-medium text-sop-neutral-gray-200">
            รายละเอียดเพิ่มเติม
          </label>
          <textarea
            id="reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="อธิบายปัญหาที่พบ..."
            className="w-full rounded-sop-8px border border-sop-neutral-grayalpha-200 px-4 py-3 sop-body-sm-regular text-sop-neutral-gray-200 outline-none focus:border-sop-primary-500"
          />
        </div>

        {error ? (
          <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
            {error}
          </p>
        ) : null}

        <Button type="submit" fill loading={creating} disabled={creating}>
          ส่งคำขอคืนสินค้า
        </Button>
          </form>
        </AccountCard>
      </div>
    </AccountLayout>
  );
}
