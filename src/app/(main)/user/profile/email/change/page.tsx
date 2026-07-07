'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/lib/hooks/useAuth';
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
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
    <form key={customerId} onSubmit={(e) => void handleSubmit(e)} className="max-w-md space-y-4">
      <Input
        title="อีเมลใหม่"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error ? (
        <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
          {error}
        </p>
      ) : null}
      <Button type="submit" fill loading={updating} disabled={updating}>
        บันทึก
      </Button>
    </form>
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
