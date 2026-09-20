import type { ReactNode } from 'react';

/**
 * Auth routes are full-bleed chrome-free (OTP design; /login redirects to modal).
 */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="flex min-h-dvh flex-col">{children}</div>;
}
