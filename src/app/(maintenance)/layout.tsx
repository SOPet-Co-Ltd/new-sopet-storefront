import type { ReactNode } from 'react';

/** Maintenance routes are full-bleed chrome-free (no header/footer). */
export default function MaintenanceLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="flex min-h-dvh flex-col">{children}</div>;
}
