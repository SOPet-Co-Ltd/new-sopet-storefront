'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import {
  ProfileContactEditLayout,
  ProfileFormActions,
} from '@/components/molecules/account/ProfileContactEditLayout';
import { Input } from '@/components/atoms/Input';
import { FooterMailIcon } from '@/components/atoms/icons';
import { isValidEmail } from '@/lib/helpers/email';
import { useProfile } from '@/lib/hooks/useProfile';

export default function AddEmailPage() {
  const router = useRouter();
  const { updateProfile, updating } = useProfile();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canSubmit = isValidEmail(email);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    try {
      setError(null);
      await updateProfile({ email: trimmed });
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกอีเมลได้');
    }
  };

  return (
    <AccountLayout title="เพิ่มอีเมล">
      <ProfileContactEditLayout
        icon={<FooterMailIcon />}
        description="ใช้รับการแจ้งเตือนคำสั่งซื้อ อัปเดตสถานะจัดส่ง และข่าวสารจาก SOPet"
      >
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <Input
            title="อีเมล"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            variant="bordered"
          />
          {error ? (
            <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
              {error}
            </p>
          ) : null}
          <ProfileFormActions submitLabel="บันทึกอีเมล" loading={updating} disabled={!canSubmit} />
        </form>
      </ProfileContactEditLayout>
    </AccountLayout>
  );
}
