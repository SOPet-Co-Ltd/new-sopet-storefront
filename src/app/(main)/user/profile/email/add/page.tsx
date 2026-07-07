'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useProfile } from '@/lib/hooks/useProfile';

export default function AddEmailPage() {
  const router = useRouter();
  const { updateProfile, updating } = useProfile();
  const [email, setEmail] = useState('');
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
    <AccountLayout title="เพิ่มอีเมล">
      <form onSubmit={(e) => void handleSubmit(e)} className="max-w-md space-y-4">
        <Input
          title="อีเมล"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
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
    </AccountLayout>
  );
}
