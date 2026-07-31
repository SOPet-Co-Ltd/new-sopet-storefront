import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

type HeldUnpaidPaymentBlockProps = {
  className?: string;
};

export function HeldUnpaidPaymentBlock({ className }: HeldUnpaidPaymentBlockProps) {
  return (
    <div
      className={
        className ??
        'mt-6 rounded-xl border border-sop-system-warning-200 bg-sop-system-warning-100 p-4'
      }
      data-testid="held-unpaid-payment-block"
      role="alert"
      aria-live="assertive"
    >
      <p className="sop-body-sm-regular text-sop-system-warning-500">
        {STORE_SUSPENSION_HOLD_COPY.paymentHeldBlocked}
      </p>
    </div>
  );
}
