'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
  label: string;
  path: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center gap-2">
        {items.map(({ path, label }, index) => {
          const isActive = pathname === path;

          return (
            <li key={`${path}-${index}`} className="inline-flex items-center">
              {index > 0 && <p className="text-sop-neutral-gray-400 px-2">&gt;</p>}
              <Link
                href={path}
                className={cn(
                  'inline-flex items-center sop-breadcrumb text-sop-neutral-gray-400',
                  index > 0 && 'ml-2',
                  isActive && 'text-sop-neutral-gray-200',
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
