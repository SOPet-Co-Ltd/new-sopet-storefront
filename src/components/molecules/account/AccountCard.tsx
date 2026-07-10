import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AccountCardPadding = 'sm' | 'md' | 'lg';

type AccountCardProps = {
  children?: ReactNode;
  variant?: 'default' | 'loading' | 'error';
  padding?: AccountCardPadding;
  className?: string;
};

const paddingClasses: Record<AccountCardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-12',
};

export function AccountCard({
  children,
  variant = 'default',
  padding = 'sm',
  className,
}: AccountCardProps) {
  if (variant === 'loading') {
    return (
      <div
        aria-busy="true"
        className={cn(
          'animate-pulse rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white',
          paddingClasses[padding],
          className,
        )}
        data-testid="account-card-loading"
      >
        <div className="space-y-3">
          <div className="h-4 w-1/3 rounded-sop-8px bg-sop-neutral-gray-500" />
          <div className="h-16 rounded-sop-8px bg-sop-neutral-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-sop-12px border bg-sop-base-white',
        paddingClasses[padding],
        variant === 'error'
          ? 'border-sop-system-error-200 bg-sop-system-error-50'
          : 'border-sop-neutral-grayalpha-200',
        className,
      )}
      data-testid={variant === 'error' ? 'account-card-error' : 'account-card'}
    >
      {children}
    </div>
  );
}
