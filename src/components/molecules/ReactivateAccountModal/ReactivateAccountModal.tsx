'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { useAuth } from '@/lib/hooks/useAuth';

type ReactivateAccountModalProps = {
  isOpen: boolean;
  reactivationToken: string | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReactivateAccountModal({
  isOpen,
  reactivationToken,
  onClose,
  onSuccess,
}: ReactivateAccountModalProps) {
  const { reactivateAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleReactivate = async () => {
    if (!reactivationToken) {
      setError('ไม่พบโทเคนสำหรับเปิดใช้งานบัญชี');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await reactivateAccount(reactivationToken);
      onSuccess();
    } catch (reactivateError) {
      setError(
        reactivateError instanceof Error
          ? reactivateError.message
          : 'ไม่สามารถเปิดใช้งานบัญชีได้ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      header={
        <h2 className="sop-headline-sm-medium text-sop-neutral-gray-200">
          เปิดใช้งานบัญชีอีกครั้ง
        </h2>
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            ยกเลิก
          </Button>
          <Button type="button" onClick={() => void handleReactivate()} loading={loading}>
            เปิดใช้งานบัญชี
          </Button>
        </div>
      }
    >
      <p className="sop-body-sm-regular text-sop-neutral-gray-400">
        บัญชีของคุณอยู่ในสถานะรอลบ ต้องการเปิดใช้งานอีกครั้งหรือไม่?
      </p>
      {error && (
        <p role="alert" className="mt-4 sop-body-sm-regular text-sop-system-error-400">
          {error}
        </p>
      )}
    </Modal>
  );
}
