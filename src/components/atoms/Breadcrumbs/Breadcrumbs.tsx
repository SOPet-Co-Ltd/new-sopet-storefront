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
    <nav className={cn('flex', className)} aria-label="breadcrumb">
      <ol className="inline-flex items-center gap-2">
        {items.map(({ path, label }, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${path}-${index}`} className="inline-flex items-center">
              {index > 0 ? (
                <span className="px-2 text-sop-neutral-gray-400" aria-hidden="true">
                  &gt;
                </span>
              ) : null}
              {isCurrent ? (
                <span
                  className="inline-flex items-center sop-breadcrumb text-sop-neutral-gray-200"
                  aria-current="page"
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={path}
                  className={cn(
                    'inline-flex items-center sop-breadcrumb text-sop-neutral-gray-400',
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
