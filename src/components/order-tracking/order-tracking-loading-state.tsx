import { AccountCard } from '@/components/molecules/account/AccountCard';

export function OrderTrackingLoadingState() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-6" data-testid="order-tracking-loading">
      <p role="status" className="sr-only">
        กำลังโหลดข้อมูลคำสั่งซื้อ
      </p>
      <div className="h-8 w-32 rounded-sop-12px bg-sop-neutral-grayalpha-200" />
      <div className="h-64 rounded-sop-24px bg-sop-neutral-grayalpha-200" />
      <AccountCard variant="loading" />
    </div>
  );
}
