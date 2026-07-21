'use client';

import { useMemo } from 'react';
import { usePaymentCountdown } from '@/lib/hooks/usePaymentCountdown';
import { cn } from '@/lib/utils';

// Mirrors backend PAYMENT_UNPAID_ORDER_CANCEL_AFTER_MS (default 24h) —
// unpaid orders are auto-cancelled this long after creation.
export const UNPAID_ORDER_CANCEL_AFTER_MS = 24 * 60 * 60 * 1000;

export function getPaymentDeadlineIso(createdAt: string): string | null {
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) {
    return null;
  }
  return new Date(createdMs + UNPAID_ORDER_CANCEL_AFTER_MS).toISOString();
}

export function formatHoursCountdown(remainingMs: number): string {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

type OrderPaymentCountdownProps = {
  createdAt: string;
  compact?: boolean;
};

export function OrderPaymentCountdown({ createdAt, compact = false }: OrderPaymentCountdownProps) {
  const expiresAt = useMemo(() => getPaymentDeadlineIso(createdAt), [createdAt]);
  const { remainingMs, isExpired } = usePaymentCountdown(expiresAt);

  if (remainingMs === null) {
    return null;
  }

  if (isExpired) {
    return (
      <div
        className={cn(
          'rounded-sop-8px bg-sop-system-error-100',
          compact ? 'px-3 py-1.5' : 'px-4 py-3',
        )}
        data-testid="order-payment-countdown"
      >
        <p
          className={cn(
            'text-sop-system-error-500',
            compact ? 'sop-body-xs-medium' : 'sop-body-sm-medium',
          )}
          role="alert"
        >
          หมดเวลาชำระเงิน คำสั่งซื้อนี้จะถูกยกเลิกอัตโนมัติ
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-sop-8px bg-sop-system-warning-100',
        compact ? 'px-3 py-1.5' : 'px-4 py-3',
      )}
      data-testid="order-payment-countdown"
    >
      <p
        className={cn(
          'flex flex-wrap items-baseline gap-x-1 text-sop-system-warning-500',
          compact ? 'sop-body-xs-regular' : 'sop-body-sm-regular',
        )}
      >
        <span className="whitespace-nowrap">
          กรุณาชำระเงินภายใน{' '}
          <span
            className={cn('tabular-nums', compact ? 'sop-body-xs-medium' : 'sop-body-sm-medium')}
            aria-live="polite"
          >
            {formatHoursCountdown(remainingMs)}
          </span>
        </span>
        <span className="min-w-0">มิฉะนั้นคำสั่งซื้อจะถูกยกเลิกอัตโนมัติ</span>
      </p>
    </div>
  );
}
