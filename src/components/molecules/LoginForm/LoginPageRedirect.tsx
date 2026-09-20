'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { LoginNotice } from '@/components/molecules/LoginForm/LoginForm';
import { useLoginModal } from '@/lib/providers/LoginModalProvider';

type LoginPageRedirectProps = {
  notice?: LoginNotice;
};

export function LoginPageRedirect({ notice = null }: LoginPageRedirectProps) {
  const router = useRouter();
  const { openLoginModal } = useLoginModal();

  useEffect(() => {
    openLoginModal({ notice: notice ?? undefined });
    router.replace('/');
  }, [notice, openLoginModal, router]);

  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      data-testid="login-page-redirect"
    >
      <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังเปิดหน้าเข้าสู่ระบบ...</p>
    </div>
  );
}
