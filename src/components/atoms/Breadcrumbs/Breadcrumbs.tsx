'use client';

import Link from 'next/link';
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
  return (
    <nav className={cn('flex min-w-0 max-w-full', className)} aria-label="breadcrumb">
      <ol className="flex min-w-0 max-w-full flex-nowrap items-center gap-2">
        {items.map(({ path, label }, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li
              key={`${path}-${index}`}
              className={cn(
                'inline-flex items-center',
                isCurrent ? 'min-w-0 flex-1 overflow-hidden' : 'shrink-0',
              )}
            >
              {index > 0 ? (
                <span className="px-2 text-sop-neutral-gray-400" aria-hidden="true">
                  &gt;
                </span>
              ) : null}
              {isCurrent ? (
                <span
                  className="block min-w-0 truncate sop-breadcrumb text-sop-neutral-gray-200"
                  aria-current="page"
                  title={label}
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={path}
                  className={cn(
                    'inline-flex items-center whitespace-nowrap sop-breadcrumb text-sop-neutral-gray-400',
                    index > 0 && 'ml-2',
                  )}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
