'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/atoms/Modal';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCheckout as useCheckoutMutations } from '@/lib/hooks/useCheckout';
import { useActiveStorePromotions } from '@/lib/hooks/useActiveStorePromotions';
import {
  categorizeStorePromotions,
  estimatePromotionDiscount,
  formatStorePromotionDiscountLabel,
  getInitialStorePromotionSelection,
  type StorePromotion,
  type StorePromotionModalSelection,
  type StorePromotionSelection,
} from '@/lib/checkout/storePromotionUtils';
import { cn } from '@/lib/utils';
import {
  NoStoreDiscountCard,
  PromotionCouponsEmptyState,
  SelectableStorePromotionCard,
  UnavailableStorePromotionCard,
} from './StorePromotionCouponCard';

type PromoSectionProps = {
  title: string;
  count: number;
  children: React.ReactNode;
};

function PromoSection({ title, count, children }: PromoSectionProps) {
  if (count === 0) return null;

  return (
    <section className="flex flex-col gap-sop-12px">
      <h3 className="sop-body-sm-regular text-sop-neutral-gray-200">
        {title} ({count})
      </h3>
      {children}
    </section>
  );
}

type CheckoutStorePromotionModalProps = {
  isOpen: boolean;
  storeId: string;
  storeName: string;
  storeSubtotal: number;
  appliedPromotion: StorePromotionSelection;
  onClose: () => void;
  onConfirm: (promotion: StorePromotionSelection) => void;
};

export function CheckoutStorePromotionModal({
  isOpen,
  storeId,
  storeName,
  storeSubtotal,
  appliedPromotion,
  onClose,
  onConfirm,
}: CheckoutStorePromotionModalProps) {
  const isMobile = useIsMobile(768);
  const { isAuthenticated } = useAuth();
  const isGuest = !isAuthenticated;
  const { promotions, loading, error } = useActiveStorePromotions(isOpen ? storeId : null);
  const { validatePromotion, validatingPromotion } = useCheckoutMutations();

  const [manualCode, setManualCode] = useState('');
  const [selection, setSelection] = useState<StorePromotionModalSelection>(() =>
    getInitialStorePromotionSelection(appliedPromotion),
  );
  const [validatedPromotions, setValidatedPromotions] = useState<StorePromotion[]>([]);
  const [manualError, setManualError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const allPromotions = useMemo(() => {
    const byCode = new Map<string, StorePromotion>();

    for (const promotion of promotions) {
      byCode.set(promotion.code.toUpperCase(), promotion);
    }

    for (const promotion of validatedPromotions) {
      byCode.set(promotion.code.toUpperCase(), promotion);
    }

    return Array.from(byCode.values());
  }, [promotions, validatedPromotions]);

  const { available, unavailable } = useMemo(
    () => categorizeStorePromotions(allPromotions, storeSubtotal, { isGuest }),
    [allPromotions, isGuest, storeSubtotal],
  );

  const selectedPromotion = useMemo(() => {
    if (selection.type !== 'promo') return null;
    return (
      allPromotions.find(
        (promotion) => promotion.code.toUpperCase() === selection.code.toUpperCase(),
      ) ?? null
    );
  }, [allPromotions, selection]);

  const footerDiscountAmount = useMemo(() => {
    if (selection.type === 'none' || !selectedPromotion) return 0;
    return estimatePromotionDiscount(selectedPromotion, storeSubtotal);
  }, [selectedPromotion, selection, storeSubtotal]);

  const showApplyFooter = available.length > 0 || Boolean(appliedPromotion);

  // Reset modal state when it opens/closes, adjusting state during render
  // instead of syncing via an effect (avoids an extra render pass).
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSelection(getInitialStorePromotionSelection(appliedPromotion));
      setManualCode('');
      setValidatedPromotions([]);
    } else {
      setManualError(null);
      setConfirmError(null);
      setIsConfirming(false);
    }
  }

  const handleApplyManualCode = async () => {
    const normalizedCode = manualCode.trim();
    if (!normalizedCode) {
      setManualError('กรุณากรอกโค้ดส่วนลด');
      return;
    }

    setManualError(null);

    try {
      const result = await validatePromotion({
        code: normalizedCode,
        subtotal: storeSubtotal,
        storeId,
      });

      if (!result) {
        setManualError('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
        return;
      }

      const matchedPromotion = allPromotions.find(
        (promotion) => promotion.code.toUpperCase() === result.code.toUpperCase(),
      );

      if (matchedPromotion) {
        setSelection({ type: 'promo', code: matchedPromotion.code });
      } else {
        setValidatedPromotions((prev) => [
          ...prev,
          {
            id: result.code,
            code: result.code,
            name: result.name,
            description: null,
            type: 'fixed_amount',
            discountValue: result.discountAmount,
            minPurchaseAmount: null,
            maxDiscountAmount: null,
            expiresAt: null,
            scope: 'store',
            storeId,
            conditions: null,
          },
        ]);
        setSelection({ type: 'promo', code: result.code });
      }
    } catch {
      setManualError('โค้ดส่วนลดไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  };

  const handleConfirm = async () => {
    setConfirmError(null);
    setIsConfirming(true);

    try {
      if (selection.type === 'none') {
        onConfirm(null);
        onClose();
        return;
      }

      const result = await validatePromotion({
        code: selection.code,
        subtotal: storeSubtotal,
        storeId,
      });

      if (!result) {
        setConfirmError('คูปองไม่ถูกต้อง หรือเงื่อนไขไม่ครบถ้วน');
        return;
      }

      onConfirm({
        code: result.code,
        name: result.name,
        discountAmount: result.discountAmount,
      });
      onClose();
    } catch {
      setConfirmError('คูปองไม่ถูกต้อง หรือเงื่อนไขไม่ครบถ้วน');
    } finally {
      setIsConfirming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      width={712}
      onClose={onClose}
      data-testid="checkout-store-promotion-modal"
      header={
        <div className="flex w-full flex-col gap-sop-12px">
          <h2 className="sop-body-lg-medium text-sop-neutral-gray-200">
            เลือกส่วนลดร้านค้า {storeName}
          </h2>
          <div className="flex items-stretch gap-sop-16px">
            <div className="min-w-0 flex-1">
              <Input
                hasTitle={false}
                title=""
                variant="flat"
                size="md"
                placeholder="กรอกโค้ดส่วนลด"
                value={manualCode}
                onChange={(event) => {
                  setManualCode(event.target.value);
                  if (manualError) setManualError(null);
                }}
                state={manualError ? 'error' : 'default'}
                description={manualError ?? undefined}
                data-testid="store-promotion-code-input"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleApplyManualCode();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size={isMobile ? 'md' : 'lg'}
              rounded="rounded"
              disabled={manualCode.trim().length === 0 || validatingPromotion}
              onClick={() => {
                void handleApplyManualCode();
              }}
              data-testid="store-promotion-apply-code-button"
            >
              {validatingPromotion ? 'กำลังตรวจสอบ...' : 'ใช้โค้ด'}
            </Button>
          </div>
        </div>
      }
      footer={
        <div
          className={cn(
            'border-t border-sop-neutral-grayalpha-200 px-sop-16px pb-sop-16px pt-sop-16px',
            showApplyFooter ? 'flex items-end justify-between gap-sop-16px' : 'flex justify-center',
          )}
        >
          {showApplyFooter ? (
            <>
              <div className="min-w-0">
                <p className="sop-body-xs-regular text-sop-neutral-gray-400">ส่วนลดที่จะได้รับ</p>
                <p className="sop-headline-sm-medium text-sop-system-error-500">
                  {formatStorePromotionDiscountLabel(footerDiscountAmount)}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                rounded="full"
                className="shrink-0 px-sop-24px"
                disabled={isConfirming}
                loading={isConfirming}
                onClick={() => {
                  void handleConfirm();
                }}
                data-testid="store-promotion-confirm-button"
              >
                ใช้ส่วนลดนี้
              </Button>
            </>
          ) : (
            <Button type="button" variant="primary" size="lg" rounded="full" onClick={onClose}>
              ตกลง
            </Button>
          )}
        </div>
      }
    >
      <div className="flex max-h-95 flex-col gap-sop-20px overflow-y-auto px-sop-16px pb-sop-16px">
        {loading ? (
          <div className="animate-pulse space-y-3 py-sop-20px">
            <div className="h-27.5 rounded-sop-20px bg-sop-neutral-gray-500" />
            <div className="h-27.5 rounded-sop-20px bg-sop-neutral-gray-500" />
          </div>
        ) : null}

        {error ? (
          <p className="sop-body-sm-regular text-sop-system-error-500">
            ไม่สามารถโหลดส่วนลดร้านค้าได้
          </p>
        ) : null}

        {!loading ? (
          <>
            <PromoSection title="ใช้ได้ตอนนี้" count={available.length}>
              <div className="grid grid-cols-1 gap-sop-12px sm:grid-cols-2">
                {available.map((promotion) => {
                  const isSelected =
                    selection.type === 'promo' &&
                    selection.code.toUpperCase() === promotion.code.toUpperCase();

                  return (
                    <SelectableStorePromotionCard
                      key={promotion.id}
                      promotion={promotion}
                      storeSubtotal={storeSubtotal}
                      selected={isSelected}
                      onSelect={() => setSelection({ type: 'promo', code: promotion.code })}
                    />
                  );
                })}
                {showApplyFooter ? (
                  <NoStoreDiscountCard
                    selected={selection.type === 'none'}
                    onSelect={() => setSelection({ type: 'none' })}
                  />
                ) : null}
              </div>
            </PromoSection>

            <PromoSection title="ใช้ไม่ได้ตอนนี้" count={unavailable.length}>
              <div className="grid grid-cols-1 gap-sop-12px sm:grid-cols-2">
                {unavailable.map((promotion) => (
                  <UnavailableStorePromotionCard
                    key={promotion.id}
                    promotion={promotion}
                    storeSubtotal={storeSubtotal}
                    isGuest={isGuest}
                  />
                ))}
              </div>
            </PromoSection>

            {available.length === 0 && unavailable.length === 0 ? (
              <PromotionCouponsEmptyState />
            ) : null}
          </>
        ) : null}

        {confirmError ? (
          <p className="sop-body-xs-regular text-sop-system-error-500">{confirmError}</p>
        ) : null}
      </div>
    </Modal>
  );
}
