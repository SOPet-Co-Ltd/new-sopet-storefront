'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  ProfileContactEditLayout,
  ProfileFormActions,
} from '@/components/molecules/account/ProfileContactEditLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { CalendarIcon } from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import {
  formatCustomerDateOfBirth,
  toDateInputValue,
  validateCustomerDateOfBirth,
} from '@/lib/helpers/dateOfBirth';

export default function CustomerDateOfBirthPage() {
  const router = useRouter();
  const { customer } = useAuth();
  const { updateProfile, updating } = useProfile();
  const initialDateOfBirth = toDateInputValue(customer?.dateOfBirth);
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);
  const [error, setError] = useState<string | null>(null);
  const hasDateOfBirth = Boolean(initialDateOfBirth);
  const hasChanged = dateOfBirth !== initialDateOfBirth;
  const formattedCurrent = formatCustomerDateOfBirth(customer?.dateOfBirth);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateCustomerDateOfBirth(dateOfBirth);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setError(null);
      await updateProfile({ dateOfBirth: dateOfBirth.trim() });
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกวันเกิดได้');
    }
  };

  const handleClear = async () => {
    if (!hasDateOfBirth) return;

    try {
      setError(null);
      await updateProfile({ dateOfBirth: null });
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถลบวันเกิดได้');
    }
  };

  return (
    <AccountLayout title={hasDateOfBirth ? 'เปลี่ยนวันเกิด' : 'เพิ่มวันเกิด'}>
      <ProfileContactEditLayout
        icon={<CalendarIcon size={{ mobile: 20, desktop: 20 }} />}
        description="ใช้ปรับแต่งประสบการณ์และโปรโมชันที่เหมาะกับคุณ"
        currentValue={
          formattedCurrent
            ? {
                label: 'วันเกิดปัจจุบัน',
                value: formattedCurrent,
              }
            : undefined
        }
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            title="วันเกิด"
            type="date"
            value={dateOfBirth}
            max={new Date().toISOString().slice(0, 10)}
            min="1900-01-01"
            onChange={(e) => {
              setDateOfBirth(e.target.value);
              if (error) setError(null);
            }}
            variant="bordered"
            state={error ? 'error' : 'default'}
            description={error ?? undefined}
          />

          <ProfileFormActions
            submitLabel={hasDateOfBirth ? 'บันทึกวันเกิด' : 'เพิ่มวันเกิด'}
            loading={updating}
            disabled={!dateOfBirth.trim() || !hasChanged}
          />

          {hasDateOfBirth ? (
            <div className="flex justify-center pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={updating}
                onClick={() => void handleClear()}
              >
                ลบวันเกิด
              </Button>
            </div>
          ) : null}
        </form>
      </ProfileContactEditLayout>
    </AccountLayout>
  );
}
