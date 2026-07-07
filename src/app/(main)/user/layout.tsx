import { AccountAuthGuard } from '@/components/templates/AccountLayout/AccountAuthGuard';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <AccountAuthGuard>{children}</AccountAuthGuard>;
}
