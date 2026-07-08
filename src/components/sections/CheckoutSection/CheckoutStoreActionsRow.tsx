'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  CheckIcon,
  RightArrowIcon,
  TicketSaleIcon,
  TruckIcon,
} from '@/components/atoms/icons';
import { useShippingOptions } from '@/lib/hooks/useShippingOptions';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { formatCheckoutPrice } from './checkoutOrderItemUtils';
import { CheckoutShippingMethodModal } from './CheckoutShippingMethodModal';
import { CheckoutStorePromotionModal } from './CheckoutStorePromotionModal';

type CheckoutStoreActionButtonProps = {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  testId?: string;
};

function CheckoutStoreActionButton({
  label,
  icon,
  onClick,
  disabled = false,
  children,
  testId,
}: CheckoutStoreActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="flex min-w-0 flex-1 cursor-pointer items-center gap-sop-12px text-left disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-sop-32px w-sop-32px shrink-0 items-center justify-center" aria-hidden>
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start justify-center">
        <span className="sop-body-xs-regular text-sop-base-black">{label}</span>
        {children}
      </span>
      <span className="flex h-sop-32px w-sop-32px shrink-0 items-center justify-center" aria-hidden>
        <RightArrowIcon size={{ mobile: 20 }} color="#949495" />
      </span>
    </button>
  );
}

type CheckoutStoreActionsRowProps = {
  storeId: string;
  storeName: string;
  storeSubtotal: number;
};

export function CheckoutStoreActionsRow({
  storeId,
  storeName,
  storeSubtotal,
}: CheckoutStoreActionsRowProps) {
  const { options, loading, error } = useShippingOptions(storeId);
  const { shippingByStoreId, setShipping, storePromotionsByStoreId, setStorePromotion } =
    useCheckout();
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

  const appliedPromotion = storePromotionsByStoreId[storeId] ?? null;
  const appliedDiscountAmount = appliedPromotion?.discountAmount ?? 0;

  const selectedOptionId = shippingByStoreId[storeId]?.shippingOptionId ?? null;
  const selectedOption = options.find((option) => option.id === selectedOptionId) ?? null;

  useEffect(() => {
    if (options.length === 0 || selectedOptionId) return;

    const firstOption = options[0];
    if (firstOption) {
      setShipping(storeId, { shippingOptionId: firstOption.id, shippingFee: firstOption.price });
    }
  }, [options, selectedOptionId, setShipping, storeId]);

  const shippingDisabled = loading || Boolean(error) || options.length === 0;

  return (
    <>
      <div
        className="flex w-full items-stretch gap-sop-20px"
        data-testid={`checkout-store-actions-${storeId}`}
      >
        <CheckoutStoreActionButton
          label="ส่วนลดร้านค้า"
          icon={<TicketSaleIcon size={{ mobile: 32 }} color="#9C6ADE" />}
          onClick={() => setIsPromotionModalOpen(true)}
          testId={`checkout-store-discount-${storeId}`}
        >
          {appliedDiscountAmount > 0 ? (
            <span className="flex items-center gap-sop-4px">
              <CheckIcon size={{ mobile: 24 }} color="#31B953" />
              <span className="sop-body-sm-medium text-sop-system-success-500">
                ใช้ส่วนลด {formatCheckoutPrice(appliedDiscountAmount)} แล้ว
              </span>
            </span>
          ) : (
            <span className="sop-body-sm-medium text-sop-neutral-gray-400 underline">
              เพิ่มส่วนลดร้านค้า
            </span>
          )}
        </CheckoutStoreActionButton>

        <div className="w-px shrink-0 self-stretch bg-sop-neutral-grayalpha-200" />

        <CheckoutStoreActionButton
          label="การจัดส่ง"
          icon={<TruckIcon size={{ mobile: 32 }} color="#6E76EE" />}
          disabled={shippingDisabled}
          onClick={() => setIsShippingModalOpen(true)}
          testId={`checkout-store-shipping-${storeId}`}
        >
          {loading ? (
            <span className="sop-body-sm-medium text-sop-neutral-gray-400">กำลังโหลด...</span>
          ) : error ? (
            <span className="sop-body-sm-medium text-sop-system-error-500">
              ไม่สามารถโหลดตัวเลือกจัดส่งได้
            </span>
          ) : selectedOption ? (
            <span className="sop-body-sm-medium">
              <span className="text-sop-base-black">{selectedOption.name}</span>{' '}
              <span className="text-[#6E76EE]">{formatCheckoutPrice(selectedOption.price)}</span>
            </span>
          ) : (
            <span className="sop-body-sm-medium text-sop-neutral-gray-400 underline">
              เลือกการจัดส่ง
            </span>
          )}
        </CheckoutStoreActionButton>
      </div>

      {isPromotionModalOpen ? (
        <CheckoutStorePromotionModal
          isOpen={isPromotionModalOpen}
          storeId={storeId}
          storeName={storeName}
          storeSubtotal={storeSubtotal}
          appliedPromotion={appliedPromotion}
          onClose={() => setIsPromotionModalOpen(false)}
          onConfirm={(promotion) => setStorePromotion(storeId, promotion)}
        />
      ) : null}

      {isShippingModalOpen ? (
        <CheckoutShippingMethodModal
          isOpen={isShippingModalOpen}
          storeName={storeName}
          options={options}
          selectedOptionId={selectedOptionId}
          onClose={() => setIsShippingModalOpen(false)}
          onConfirm={(optionId) => {
            const option = options.find((candidate) => candidate.id === optionId);
            setShipping(storeId, {
              shippingOptionId: optionId,
              shippingFee: option?.price ?? 0,
            });
          }}
        />
      ) : null}
    </>
  );
}
