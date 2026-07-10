import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AccountStatusBadgeVariant = 'default' | 'error' | 'warning' | 'success';

type AccountStatusBadgeProps = {
  children: ReactNode;
  variant?: AccountStatusBadgeVariant;
  className?: string;
};

const variantClasses: Record<AccountStatusBadgeVariant, string> = {
  default: 'bg-sop-primary-100 text-sop-primary-600',
  error: 'bg-sop-system-error-100 text-sop-system-error-500',
  warning: 'bg-sop-system-warning-100 text-sop-system-warning-500',
  success: 'bg-sop-system-success-100 text-sop-system-success-500',
};

export function AccountStatusBadge({
  children,
  variant = 'default',
  className,
}: AccountStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-sop-8px px-2 py-0.5 sop-body-xs-medium',
        variantClasses[variant],
        className,
      )}
      data-testid="account-status-badge"
    >
      {children}
    </span>
  );
}
