'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';

type RegisterFormProps = {
  customerId: string;
  initialFullName: string;
  initialEmail: string;
};

function RegisterForm({ customerId, initialFullName, initialEmail }: RegisterFormProps) {
  const router = useRouter();
  const { updateProfile, updating } = useProfile();
  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError('กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    try {
      setError(null);
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
      });
      router.push('/user/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <form key={customerId} onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input
        title="ชื่อ-นามสกุล"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        isRequire
      />
      <Input
        title="อีเมล (ไม่บังคับ)"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error ? (
        <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
          {error}
        </p>
      ) : null}
      <Button type="submit" fill loading={updating} disabled={updating}>
        บันทึกและเริ่มใช้งาน
      </Button>
    </form>
  );
}

export default function UserRegisterPage() {
  const { customer } = useAuth();

  return (
    <AccountLayout title="ลงทะเบียนบัญชี">
      <div className="max-w-lg space-y-4">
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">
          กรอกข้อมูลเพิ่มเติมเพื่อเริ่มใช้งานบัญชีของคุณ
        </p>
        <AccountCard>
          <RegisterForm
          key={customer?.id ?? 'guest'}
          customerId={customer?.id ?? 'guest'}
          initialFullName={customer?.fullName ?? ''}
          initialEmail={customer?.email ?? ''}
        />
        </AccountCard>
      </div>
    </AccountLayout>
  );
}
