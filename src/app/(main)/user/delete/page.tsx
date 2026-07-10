'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { Button } from '@/components/atoms/Button';
import { RequestAccountDeletionDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [requestDeletion, { loading }] = useMutation(RequestAccountDeletionDocument);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmed) {
      setError('กรุณายืนยันการลบบัญชีก่อนดำเนินการ');
      return;
    }

    try {
      setError(null);
      await requestDeletion();
      await logout();
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถส่งคำขอลบบัญชีได้');
    }
  };

  return (
    <AccountLayout title="คำขอลบบัญชี">
      <div className="max-w-lg space-y-6">
        <AccountCard padding="md" variant="error">
          <p className="sop-body-md-medium text-sop-system-error-500">คำเตือน</p>
          <p className="mt-2 sop-body-sm-regular text-sop-neutral-gray-300">
            การลบบัญชีจะทำให้ไม่สามารถเข้าถึงข้อมูลคำสั่งซื้อ ที่อยู่ และรายการโปรดได้
            การดำเนินการนี้อาจไม่สามารถย้อนกลับได้
          </p>
        </AccountCard>

        <label className="flex items-start gap-3 sop-body-sm-regular text-sop-neutral-gray-300">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-4 w-4 accent-sop-system-error-400"
          />
          ฉันเข้าใจและต้องการลบบัญชีของฉัน
        </label>

        {error ? (
          <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
            {error}
          </p>
        ) : null}

        <Button
          variant="destructive"
          fill
          loading={loading}
          disabled={loading}
          onClick={() => void handleDelete()}
        >
          ส่งคำขอลบบัญชี
        </Button>
      </div>
    </AccountLayout>
  );
}
