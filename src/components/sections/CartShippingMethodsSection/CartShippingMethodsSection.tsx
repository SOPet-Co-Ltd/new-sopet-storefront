'use client';

import { useShippingOptions } from '@/lib/hooks/useShippingOptions';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';

type CartShippingMethodsSectionProps = {
  storeId: string;
  storeName: string;
};

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

export function CartShippingMethodsSection({
  storeId,
  storeName,
}: CartShippingMethodsSectionProps) {
  const { options, loading, error } = useShippingOptions(storeId);
  const { shippingByStoreId, setShipping } = useCheckout();
  const selectedId = shippingByStoreId[storeId]?.shippingOptionId ?? null;

  if (loading) {
    return (
      <div
        className="border-t border-t-sop-neutral-grayalpha-200 px-sop-16px py-sop-16px lg:px-sop-24px"
        data-testid={`shipping-loading-${storeId}`}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-32 rounded bg-sop-neutral-gray-500" />
          <div className="h-10 rounded-sop-12px bg-sop-neutral-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="border-t border-t-sop-neutral-grayalpha-200 px-sop-16px py-sop-16px lg:px-sop-24px"
        data-testid={`shipping-error-${storeId}`}
      >
        <p className="sop-body-sm-regular text-sop-system-error-500">
          ไม่สามารถโหลดตัวเลือกจัดส่งได้
        </p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div
        className="border-t border-t-sop-neutral-grayalpha-200 px-sop-16px py-sop-16px lg:px-sop-24px"
        data-testid={`shipping-empty-${storeId}`}
      >
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">ไม่มีตัวเลือกจัดส่ง</p>
      </div>
    );
  }

  return (
    <div
      className="border-t border-t-sop-neutral-grayalpha-200 px-sop-16px py-sop-16px lg:px-sop-24px"
      data-testid={`shipping-options-${storeId}`}
    >
      <p className="mb-sop-12px sop-body-sm-medium text-sop-neutral-gray-300">
        การจัดส่ง — {storeName}
      </p>
      <div className="flex flex-col gap-sop-8px" role="radiogroup" aria-label={`ตัวเลือกจัดส่ง ${storeName}`}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`shipping-option-${storeId}-${option.id}`}
              onClick={() =>
                setShipping(storeId, {
                  shippingOptionId: option.id,
                  shippingFee: option.price,
                })
              }
              className={cn(
                'flex items-center justify-between rounded-sop-12px border px-sop-16px py-sop-12px text-left transition-colors',
                isSelected
                  ? 'border-sop-primary-500 bg-sop-primary-100'
                  : 'border-sop-neutral-grayalpha-300 bg-sop-base-white hover:bg-sop-primary-50',
              )}
            >
              <span className="sop-body-sm-regular text-sop-neutral-gray-300">{option.name}</span>
              <span className="sop-body-sm-medium text-sop-secondary-600">
                {formatPrice(option.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
