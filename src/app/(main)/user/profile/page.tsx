'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';

type ProfileDetailsFormProps = {
  customerId: string;
  initialFullName: string;
  initialEmail: string;
};

function ProfileDetailsForm({
  customerId,
  initialFullName,
  initialEmail,
}: ProfileDetailsFormProps) {
  const { updateProfile, updating, error } = useProfile();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      );
    }
  };

  return (
    <form key={customerId} onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input
        title="ชื่อ-นามสกุล"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        title="อีเมล"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {success ? (
        <p className="sop-body-sm-regular text-sop-system-success-500">บันทึกข้อมูลสำเร็จ</p>
      ) : null}
      {(submitError ?? error?.message) ? (
        <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
          {submitError ?? error?.message}
        </p>
      ) : null}

      <Button type="submit" fill loading={updating} disabled={updating}>
        บันทึกข้อมูล
      </Button>
    </form>
  );
}

export default function UserProfilePage() {
  const { customer } = useAuth();

  return (
    <AccountLayout title="ข้อมูลส่วนตัว">
      <div className="max-w-lg space-y-6">
        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="sop-body-sm-regular text-sop-neutral-gray-400">เบอร์โทรศัพท์</p>
              <p className="sop-body-sm-medium text-sop-neutral-gray-200">
                {customer?.phone ? formatThaiPhoneNumber(customer.phone) : 'ยังไม่ได้เพิ่ม'}
              </p>
            </div>
            <Link
              href={customer?.phone ? '/user/profile/phone/change' : '/user/profile/phone/add'}
              className="sop-body-sm-medium text-sop-secondary-500 underline"
            >
              {customer?.phone ? 'เปลี่ยน' : 'เพิ่ม'}
            </Link>
          </div>
        </div>

        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="sop-body-sm-regular text-sop-neutral-gray-400">อีเมล</p>
              <p className="sop-body-sm-medium text-sop-neutral-gray-200">
                {customer?.email ?? 'ยังไม่ได้เพิ่ม'}
              </p>
            </div>
            <Link
              href={customer?.email ? '/user/profile/email/change' : '/user/profile/email/add'}
              className="sop-body-sm-medium text-sop-secondary-500 underline"
            >
              {customer?.email ? 'เปลี่ยน' : 'เพิ่ม'}
            </Link>
          </div>
        </div>

        <ProfileDetailsForm
          key={customer?.id ?? 'guest'}
          customerId={customer?.id ?? 'guest'}
          initialFullName={customer?.fullName ?? ''}
          initialEmail={customer?.email ?? ''}
        />
      </div>
    </AccountLayout>
  );
}
