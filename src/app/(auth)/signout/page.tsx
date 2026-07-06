'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SignOutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    void logout().finally(() => {
      router.replace('/');
    });
  }, [logout, router]);

  return (
    <p className="sop-body-sm-regular text-sop-neutral-gray-400" data-testid="signout-page">
      กำลังออกจากระบบ...
    </p>
  );
}
