'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { CloseIcon, PlusIcon, TicketSaleIcon } from '@/components/atoms/icons';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  applyCheckoutPromotionCode,
  getPromotionApplyErrorMessage,
} from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import {
  formatAvailablePromotionSuggestion,
  formatPlatformPromotionAppliedDescription,
  getPlatformPromotionSectionStage,
  type PlatformPromotionSectionStage,
  type PlatformPromotionSelection,
} from '@/lib/checkout/platformPromotionUtils';
import { categorizeStorePromotions, type StorePromotion } from '@/lib/checkout/storePromotionUtils';
import { useCheckout as useCheckoutMutations } from '@/lib/hooks/useCheckout';
import { useActivePlatformPromotions } from '@/lib/hooks/useActivePlatformPromotions';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';
import { CheckoutPlatformPromotionModal } from './CheckoutPlatformPromotionModal';

type PlatformPromotionBottomCardProps = {
  stage: PlatformPromotionSectionStage;
  availableCount: number;
  name?: string;
  description?: string;
  onOpenModal: () => void;
  onRemove: () => void;
};

function PlatformPromotionBottomCard({
  stage,
  availableCount,
  name,
  description,
  onOpenModal,
  onRemove,
}: PlatformPromotionBottomCardProps) {
  const isMobile = useIsMobile(768);

  if (stage === 'active') {
    return (
      <div
        className={cn(
          'flex w-full items-center gap-sop-12px rounded-sop-16px border border-sop-neutral-grayalpha-300 py-sop-12px',
          isMobile ? 'p-sop-12px' : 'px-sop-16px',
        )}
        data-testid="applied-platform-promotion"
        data-stage="active"
      >
        <span
          className="flex shrink-0 items-center rounded-sop-12px bg-sop-primary-200 p-sop-12px"
          aria-hidden
        >
          <TicketSaleIcon color="#9C6ADE" size={{ mobile: 28, desktop: 28 }} />
        </span>
        <div className="min-w-0 flex-1 text-sop-primary-500">
          <p className={isMobile ? 'sop-body-sm-medium' : 'sop-body-lg-medium'}>{name}</p>
          <p className={isMobile ? 'sop-body-xs-regular' : 'sop-body-md-regular'}>{description}</p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-sop-20px w-sop-20px shrink-0 cursor-pointer items-center justify-center"
          aria-label="ลบส่วนลดแพลตฟอร์ม"
          data-testid="remove-platform-promotion-button"
        >
          <CloseIcon color="#949495" size={{ mobile: 20, desktop: 20 }} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenModal}
      data-testid={
        stage === 'suggest'
          ? 'platform-promotion-suggest-button'
          : 'platform-promotion-picker-button'
      }
      data-stage={stage}
      className={cn(
        'flex w-full cursor-pointer items-center gap-sop-12px rounded-sop-16px border border-dashed border-sop-primary-300 text-left',
        isMobile ? 'p-sop-12px' : 'px-sop-16px py-sop-12px',
      )}
    >
      <span
        className="flex shrink-0 items-center rounded-sop-12px bg-sop-primary-200 p-sop-12px"
        aria-hidden
      >
        <PlusIcon color="#9C6ADE" size={{ mobile: 28, desktop: 28 }} />
      </span>
      {stage === 'suggest' ? (
        <span
          className={cn(
            'text-sop-primary-500 underline',
            isMobile ? 'sop-body-xs-regular' : 'sop-body-md-regular',
          )}
        >
          {formatAvailablePromotionSuggestion(availableCount)}
        </span>
      ) : (
        <span
          className={cn(
            'text-sop-primary-500',
            isMobile ? 'sop-body-xs-regular' : 'sop-body-md-regular',
          )}
        >
          เลือกส่วนลดแพลตฟอร์ม
        </span>
      )}
    </button>
  );
}

export function CheckoutPromotionSection() {
  const isMobile = useIsMobile(768);
  const { selectedSubtotal: subtotal } = useCart();
  const { promotions, loading: loadingPromotions } = useActivePlatformPromotions(true);
  const { validatePromotion, validatingPromotion } = useCheckoutMutations();
  const {
    promotionCode,
    promotionName,
    promotionDiscount,
    setPromotion,
    setPromotionName,
    setPromotionDiscount,
  } = useCheckout();
  const [manualCode, setManualCode] = useState(promotionCode ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const appliedPromotion = useMemo<PlatformPromotionSelection>(() => {
    if (!promotionCode) return null;

    return {
      code: promotionCode,
      name: promotionName ?? promotionCode,
      discountAmount: promotionDiscount,
    };
  }, [promotionCode, promotionDiscount, promotionName]);

  const availablePromotionCount = useMemo(() => {
    const { available } = categorizeStorePromotions(promotions as StorePromotion[], subtotal);
    return available.length;
  }, [promotions, subtotal]);

  const stage = getPlatformPromotionSectionStage(
    Boolean(appliedPromotion),
    availablePromotionCount,
  );

  const showBottomCard = Boolean(appliedPromotion) || !loadingPromotions;

  const clearPromotion = () => {
    setPromotion(null);
    setPromotionName(null);
    setPromotionDiscount(0);
    setManualCode('');
    setError(null);
  };

  const handleApplyCode = async () => {
    const normalizedCode = manualCode.trim();

    if (!normalizedCode) {
      setError('กรุณากรอกโค้ดส่วนลด');
      return;
    }

    setError(null);

    try {
      await applyCheckoutPromotionCode({
        code: normalizedCode,
        subtotal,
        validatePromotion,
        setPromotion,
        setPromotionName,
        setPromotionDiscount,
      });
    } catch (applyError) {
      setPromotion(null);
      setPromotionName(null);
      setPromotionDiscount(0);
      setError(getPromotionApplyErrorMessage(applyError));
    }
  };

  const handleModalConfirm = (promotion: PlatformPromotionSelection) => {
    if (!promotion) {
      clearPromotion();
      return;
    }

    setPromotion(promotion.code);
    setPromotionName(promotion.name);
    setPromotionDiscount(promotion.discountAmount);
    setManualCode(promotion.code);
    setError(null);
  };

  return (
    <>
      <section
        className="mb-sop-16px flex w-full flex-col gap-sop-16px rounded-sop-24px bg-sop-base-white px-sop-16px py-sop-20px lg:mb-sop-12px lg:px-sop-24px lg:py-sop-20px"
        data-testid="checkout-promotion-section"
        data-stage={stage}
      >
        <div className="flex items-center gap-sop-8px">
          <TicketSaleIcon color="#9C6ADE" size={{ mobile: 24, desktop: 24 }} />
          <h2 className="sop-body-md-medium text-sop-primary-500 lg:sop-body-lg-medium">
            ส่วนลดแพลตฟอร์ม Sopet
          </h2>
        </div>

        <div className="flex flex-col gap-sop-16px">
          <div className="flex flex-col gap-sop-8px">
            <div className={cn('flex gap-sop-16px', isMobile ? 'items-center' : 'items-stretch')}>
              <div className="min-w-0 flex-1">
                <Input
                  hasTitle={false}
                  title=""
                  variant="flat"
                  size="md"
                  textSize="xs"
                  state={error ? 'error' : 'default'}
                  placeholder="กรอกโค้ดส่วนลด"
                  value={manualCode}
                  onChange={(event) => {
                    setManualCode(event.target.value);
                    if (error) {
                      setError(null);
                    }
                  }}
                  className={cn(isMobile ? 'h-11 rounded-sop-8' : 'h-12 rounded-sop-12')}
                  autoComplete="off"
                  data-testid="promotion-code-input"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleApplyCode();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size={isMobile ? 'md' : 'xl'}
                rounded="rounded"
                disabled={manualCode.trim().length === 0 || validatingPromotion}
                onClick={() => {
                  void handleApplyCode();
                }}
                data-testid="promotion-apply-button"
              >
                {validatingPromotion ? 'กำลังตรวจสอบ...' : 'ใช้โค้ด'}
              </Button>
            </div>

            {error ? (
              <p className="sop-body-xs-regular text-sop-system-error-500">{error}</p>
            ) : null}
          </div>

          {showBottomCard ? (
            <PlatformPromotionBottomCard
              stage={stage}
              availableCount={availablePromotionCount}
              name={appliedPromotion?.name}
              description={
                appliedPromotion
                  ? formatPlatformPromotionAppliedDescription(appliedPromotion.discountAmount)
                  : undefined
              }
              onOpenModal={() => setIsModalOpen(true)}
              onRemove={clearPromotion}
            />
          ) : null}
        </div>
      </section>

      <CheckoutPlatformPromotionModal
        isOpen={isModalOpen}
        subtotal={subtotal}
        appliedPromotion={appliedPromotion}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}
