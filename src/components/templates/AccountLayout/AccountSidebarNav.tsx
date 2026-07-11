'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createAccountPagePrefetchHandlers } from '@/lib/account/prefetchAccountPage';
import { getNavItems, isAccountNavActive } from './accountNavConfig';

type AccountNavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  layout: 'sidebar' | 'mobile';
};

export function AccountNavLink({ href, label, active, layout }: AccountNavLinkProps) {
  const router = useRouter();
  const prefetchHandlers = createAccountPagePrefetchHandlers(href, () => router.prefetch(href));

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cn(
        layout === 'sidebar'
          ? 'block rounded-sop-8px px-4 py-2.5 sop-body-sm-regular transition-colors'
          : 'shrink-0 snap-start rounded-sop-8px px-4 py-2 sop-body-sm-regular whitespace-nowrap transition-colors',
        active
          ? 'bg-sop-primary-200 text-sop-primary-600'
          : layout === 'sidebar'
            ? 'text-sop-neutral-gray-300 hover:bg-sop-neutral-gray-500'
            : 'bg-sop-neutral-gray-500 text-sop-neutral-gray-300 hover:bg-sop-neutral-grayalpha-100',
      )}
      href={href}
      {...prefetchHandlers}
    >
      {label}
    </Link>
  );
}

type AccountSidebarNavProps = {
  pathname: string;
};

export function AccountSidebarNav({ pathname }: AccountSidebarNavProps) {
  const items = getNavItems('showInSidebar');

  return (
    <aside className="hidden lg:block">
      <nav aria-label="เมนูบัญชีผู้ใช้" className="sticky top-24 space-y-1">
        {items.map((item) => (
          <AccountNavLink
            key={item.href}
            active={isAccountNavActive(pathname, item.href)}
            href={item.href}
            label={item.label}
            layout="sidebar"
          />
        ))}
      </nav>
    </aside>
  );
}
