import type { ReactNode } from 'react';

export default function LoginOtpLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="relative flex min-h-dvh flex-1 flex-col">{children}</div>;
}
