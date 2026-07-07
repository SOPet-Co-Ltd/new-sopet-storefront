'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ACCOUNT_NAV_ITEMS } from './accountNavConfig';

type AccountLayoutProps = {
  title?: string;
  children: ReactNode;
};

export function AccountLayout({ title, children }: AccountLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8 lg:px-20">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <nav aria-label="เมนูบัญชีผู้ใช้" className="sticky top-24 space-y-1">
            {ACCOUNT_NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/user' && pathname.startsWith(`${item.href}/`)) ||
                (item.href !== '/user' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-sop-8px px-4 py-2.5 sop-body-sm-regular transition-colors',
                    active
                      ? 'bg-sop-primary-200 text-sop-primary-600'
                      : 'text-sop-neutral-gray-300 hover:bg-sop-neutral-gray-500',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          {title ? (
            <h1 className="mb-6 sop-headline-sm-medium text-sop-neutral-gray-200">{title}</h1>
          ) : null}
          {children}
        </section>
      </div>
    </div>
  );
}
