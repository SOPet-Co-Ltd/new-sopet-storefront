'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DiscountIcon } from '@/components/atoms/icons';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  applyCheckoutPromotionCode,
  getPromotionApplyErrorMessage,
} from '@/components/sections/CheckoutSection/useCheckoutSubmit';
import { useCheckout as useCheckoutMutations } from '@/lib/hooks/useCheckout';
import { useCart } from '@/lib/providers/CartProvider';
import { useCheckout } from '@/lib/providers/CheckoutProvider';

export function CheckoutPromotionSection() {
  const isMobile = useIsMobile(768);
  const { subtotal } = useCart();
  const { validatePromotion, validatingPromotion } = useCheckoutMutations();
  const { promotionCode, setPromotion, setPromotionDiscount } = useCheckout();
  const [manualCode, setManualCode] = useState(promotionCode ?? '');
  const [error, setError] = useState<string | null>(null);

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
        setPromotionDiscount,
      });
    } catch (applyError) {
      setPromotion(null);
      setPromotionDiscount(0);
      setError(getPromotionApplyErrorMessage(applyError));
    }
  };

  return (
    <section
      className="mb-sop-16px flex w-full flex-col gap-sop-16px rounded-sop-24px bg-sop-base-white px-sop-16px py-sop-20px lg:mb-sop-12px lg:px-sop-24px lg:py-sop-20px"
      data-testid="checkout-promotion-section"
    >
      <div className="flex items-center gap-sop-8px">
        <DiscountIcon color="#9C6ADE" size={{ mobile: 24 }} />
        <h2 className="sop-body-md-medium text-sop-primary-500 lg:sop-body-lg-medium">
          ส่วนลดแพลตฟอร์ม Sopet
        </h2>
      </div>

      <div className="flex flex-col gap-sop-8px">
        <div className="flex items-stretch gap-sop-8px">
          <div className="min-w-0 flex-1">
            <Input
              hasTitle={false}
              title=""
              variant="flat"
              size="md"
              state={error ? 'error' : 'default'}
              placeholder="กรอกโค้ดส่วนลด"
              value={manualCode}
              onChange={(event) => {
                setManualCode(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              className="w-full"
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
            size={isMobile ? 'md' : 'lg'}
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

        {promotionCode ? (
          <p className="sop-body-sm-regular text-sop-system-success-500" data-testid="applied-promotion-code">
            ใช้โค้ด {promotionCode} แล้ว
          </p>
        ) : null}
      </div>
    </section>
  );
}
