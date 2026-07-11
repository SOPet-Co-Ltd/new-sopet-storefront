import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AccountEmptyStateProps = {
  message: string;
  icon?: ReactNode;
  cta?: {
    label: string;
    href: string;
  };
  className?: string;
};

export function AccountEmptyState({ message, icon, cta, className }: AccountEmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center p-12 text-center', className)}
      data-testid="account-empty-state"
    >
      {icon ? <div className="mb-4 text-sop-neutral-gray-400">{icon}</div> : null}
      <p className="sop-body-sm-regular text-sop-neutral-gray-400">{message}</p>
      {cta ? (
        <Link className="mt-4 sop-body-sm-regular text-sop-secondary-500 underline" href={cta.href}>
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
