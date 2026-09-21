import { LoginPageRedirect } from '@/components/molecules/LoginForm/LoginPageRedirect';
import type { LoginNotice } from '@/components/molecules/LoginForm/LoginForm';

type Props = {
  searchParams: Promise<{ notice?: LoginNotice }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { notice } = await searchParams;

  return <LoginPageRedirect notice={notice ?? null} />;
}
