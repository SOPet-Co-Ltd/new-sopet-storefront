'use client';

import Link from 'next/link';
import { PAYMENT_ORDER_NOT_PAYABLE_COPY } from '@/lib/payment/orderNotPayable';

export function PaymentOrderNotPayableState() {
  return (
    <div data-testid="payment-order-not-payable">
      <div
        className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
        role="alert"
        aria-live="polite"
      >
        <p className="font-medium text-amber-800">{PAYMENT_ORDER_NOT_PAYABLE_COPY}</p>
      </div>
      <Link
        href="/"
        data-testid="payment-order-not-payable-home"
        className="mt-6 inline-flex h-[36px] w-full items-center justify-center rounded-sop-32 border border-sop-secondary-500 bg-transparent px-sop-16px py-sop-8px text-sop-secondary-500 transition-colors hover:bg-sop-secondary-100"
      >
        กลับหน้าแรก
      </Link>
    </div>
  );
}
