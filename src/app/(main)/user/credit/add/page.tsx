'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { CardPaymentForm } from '@/components/molecules/CheckoutPaymentSelection/CardPaymentForm';
import {
  createCheckoutCardPaymentBridge,
  EMPTY_CHECKOUT_CARD_FORM,
  prepareCardPaymentToken,
  registerCheckoutCardPaymentBridge,
  type CheckoutCardFormState,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { cleanCardNumber } from '@/components/molecules/CheckoutPaymentSelection/paymentFormat';
import { parseCardExpiry } from '@/lib/payment/omise';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';

function detectCardBrand(cardNumber: string): string {
  const digits = cleanCardNumber(cardNumber);
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6/.test(digits)) return 'discover';
  return 'unknown';
}

export default function AddCreditCardPage() {
  const router = useRouter();
  const { addPaymentMethod } = usePaymentMethods();
  const [cardForm, setCardForm] = useState<CheckoutCardFormState>(EMPTY_CHECKOUT_CARD_FORM);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardFormRef = useRef(cardForm);

  useLayoutEffect(() => {
    cardFormRef.current = cardForm;
  }, [cardForm]);

  const clearCardForm = useCallback(() => {
    setCardForm(EMPTY_CHECKOUT_CARD_FORM);
    setError(null);
  }, []);

  useEffect(() => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        getCardForm: () => cardFormRef.current,
        clearCardForm,
        getSavedPaymentMethodId: () => null,
        shouldUseSavedCard: () => false,
        getSaveCardForNextTime: () => false,
      }),
    );

    return () => {
      registerCheckoutCardPaymentBridge(null);
    };
  }, [clearCardForm]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const form = cardFormRef.current;
      const digits = cleanCardNumber(form.cardNumber);
      const { month, year } = parseCardExpiry(form.expiry);
      const token = await prepareCardPaymentToken();

      await addPaymentMethod({
        omiseCardToken: token,
        brand: detectCardBrand(digits),
        lastFour: digits.slice(-4),
        expiryMonth: month,
        expiryYear: year,
        isDefault,
      });

      router.push('/user/credit');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถเพิ่มบัตรได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout title="เพิ่มบัตรใหม่">
      <form onSubmit={(e) => void handleSubmit(e)} className="max-w-lg space-y-4">
        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4">
          <CardPaymentForm
            value={cardForm}
            onChange={(next) => {
              setCardForm(next);
              if (error) setError(null);
            }}
            error={error}
          />
        </div>

        <label className="flex items-center gap-2 sop-body-sm-regular text-sop-neutral-gray-300">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 accent-sop-primary-500"
          />
          ตั้งเป็นบัตรหลัก
        </label>

        <Button type="submit" fill loading={loading} disabled={loading}>
          บันทึกบัตร
        </Button>
      </form>
    </AccountLayout>
  );
}
