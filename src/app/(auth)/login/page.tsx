import { Suspense } from 'react';
import { LoginForm, type LoginNotice } from '@/components/molecules/LoginForm/LoginForm';

type Props = {
  searchParams: Promise<{ notice?: LoginNotice }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { notice } = await searchParams;

  return (
    <Suspense
      fallback={<div className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</div>}
    >
      <LoginForm notice={notice ?? null} />
    </Suspense>
  );
}
