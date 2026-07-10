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
import { useAuth } from '@/lib/hooks/useAuth';
import { isValidEmail } from '@/lib/helpers/email';
import { useProfile } from '@/lib/hooks/useProfile';

type ChangeEmailFormProps = {
  customerId: string;
  initialEmail: string;
};

function ChangeEmailForm({ customerId, initialEmail }: ChangeEmailFormProps) {
  const router = useRouter();
  const { updateProfile, updating } = useProfile();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const trimmedEmail = email.trim();
  const hasEmailChanged = trimmedEmail !== initialEmail.trim();
  const canSubmit = hasEmailChanged && isValidEmail(trimmedEmail);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(trimmedEmail)) {
      setError('กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    try {
      setError(null);
      await updateProfile({ email: trimmedEmail });
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกอีเมลได้');
    }
  };

  return (
    <ProfileContactEditLayout
      icon={<FooterMailIcon />}
      description="อีเมลใหม่จะใช้สำหรับการแจ้งเตือนและการติดต่อจาก SOPet"
      currentValue={{
        label: 'อีเมลปัจจุบัน',
        value: initialEmail.trim() || 'ยังไม่ได้เพิ่ม',
      }}
    >
      <form key={customerId} onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          title="อีเมลใหม่"
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
        <ProfileFormActions
          submitLabel="บันทึกอีเมลใหม่"
          loading={updating}
          disabled={!canSubmit}
        />
      </form>
    </ProfileContactEditLayout>
  );
}

export default function ChangeEmailPage() {
  const { customer } = useAuth();

  return (
    <AccountLayout title="เปลี่ยนอีเมล">
      <ChangeEmailForm
        key={customer?.id ?? 'guest'}
        customerId={customer?.id ?? 'guest'}
        initialEmail={customer?.email ?? ''}
      />
    </AccountLayout>
  );
}
