'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { AccountMobileNav } from './AccountMobileNav';
import { AccountSidebarNav } from './AccountSidebarNav';

type AccountLayoutProps = {
  title?: string;
  children: ReactNode;
};

function AccountPageTitle({ title }: { title: string }) {
  return <h1 className="mb-6 sop-headline-sm-medium text-sop-neutral-gray-200">{title}</h1>;
}

export function AccountLayout({ title, children }: AccountLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="w-full px-4 py-8 lg:px-20">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <AccountSidebarNav pathname={pathname} />

        <section className="min-w-0">
          <AccountMobileNav pathname={pathname} />
          {title ? <AccountPageTitle title={title} /> : null}
          <div className="w-full [&>*]:mx-auto">{children}</div>
        </section>
      </div>
    </div>
  );
}
