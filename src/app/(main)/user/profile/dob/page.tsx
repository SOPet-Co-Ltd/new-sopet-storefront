'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  ProfileContactEditLayout,
  ProfileFormActions,
} from '@/components/molecules/account/ProfileContactEditLayout';
import { DatePicker } from '@/components/molecules/DatePicker';
import { Button } from '@/components/atoms/Button';
import { CalendarIcon } from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import {
  formatCustomerDateOfBirth,
  toDateInputValue,
  validateCustomerDateOfBirth,
} from '@/lib/helpers/dateOfBirth';

const MAX_BIRTHDAY = new Date().toISOString().slice(0, 10);
const MIN_BIRTHDAY = '1900-01-01';

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

  const handleSubmit = async (event: FormEvent) => {
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
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 sm:space-y-6">
          <section className="space-y-2.5 sm:space-y-3" aria-labelledby="birthday-picker-heading">
            <div className="space-y-1">
              <h2
                id="birthday-picker-heading"
                className="sop-body-sm-medium text-sop-neutral-gray-200"
              >
                {hasDateOfBirth ? 'เลือกวันเกิดใหม่' : 'เลือกวันเกิดของคุณ'}
              </h2>
              <p className="sop-body-xs-regular text-sop-neutral-gray-400">
                ข้อมูลนี้จะใช้เพื่อมอบประสบการณ์และโปรโมชันที่เหมาะกับคุณเท่านั้น
              </p>
            </div>

            <DatePicker
              title="วันเกิด"
              value={dateOfBirth}
              min={MIN_BIRTHDAY}
              max={MAX_BIRTHDAY}
              placeholder="แตะเพื่อเลือกวัน เดือน และปี"
              isRequired
              state={error ? 'error' : 'default'}
              description={error ?? 'เลือกวันเกิดของคุณจากปฏิทินด้านล่าง'}
              onChange={(nextValue) => {
                setDateOfBirth(nextValue);
                if (error) setError(null);
              }}
              data-testid="birthday-date-picker"
            />
          </section>

          <ProfileFormActions
            submitLabel={hasDateOfBirth ? 'บันทึกวันเกิด' : 'เพิ่มวันเกิด'}
            loading={updating}
            disabled={!dateOfBirth.trim() || !hasChanged}
          />

          {hasDateOfBirth ? (
            <div className="rounded-sop-8px border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-500 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="sop-body-xs-regular text-sop-neutral-gray-400">ต้องการลบวันเกิด?</p>
                  <p className="sop-body-xs-regular text-sop-neutral-gray-300">
                    คุณสามารถลบข้อมูลวันเกิดได้ตลอดเวลา
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => void handleClear()}
                  className="w-full sm:w-auto"
                >
                  ลบวันเกิด
                </Button>
              </div>
            </div>
          ) : null}
        </form>
      </ProfileContactEditLayout>
    </AccountLayout>
  );
}
