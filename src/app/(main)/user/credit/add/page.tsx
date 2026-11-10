'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { CardPaymentForm } from '@/components/molecules/CheckoutPaymentSelection/CardPaymentForm';
import {
  EMPTY_CHECKOUT_CARD_FORM,
  validateCheckoutCardForm,
  type CheckoutCardFormState,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { cleanCardNumber } from '@/components/molecules/CheckoutPaymentSelection/paymentFormat';
import { getErrorMessage } from '@/lib/errors/getErrorMessage';
import {
  BeamConfigurationError,
  detectBeamCardBrand,
  getBeamCredentials,
  parseCardExpiry,
  tokenizeCard,
} from '@/lib/payment/beam';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';

function getBeamConfigurationErrorMessage(): string | null {
  try {
    getBeamCredentials();
    return null;
  } catch (err) {
    return err instanceof BeamConfigurationError ? err.message : null;
  }
}

function getAddCardErrorMessage(error: unknown): string {
  if (error instanceof BeamConfigurationError) {
    return error.message;
  }

  return getErrorMessage(error, 'ไม่สามารถเพิ่มบัตรได้');
}

export default function AddCreditCardPage() {
  const router = useRouter();
  const { addPaymentMethod, paymentMethods, loading: loadingPaymentMethods } = usePaymentMethods();
  const hasExistingCards = paymentMethods.length > 0;
  const [cardForm, setCardForm] = useState<CheckoutCardFormState>(EMPTY_CHECKOUT_CARD_FORM);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(getBeamConfigurationErrorMessage);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const form = cardForm;
      const validationError = validateCheckoutCardForm(form);
      if (validationError) {
        setError(validationError);
        return;
      }

      const digits = cleanCardNumber(form.cardNumber);
      const { month, year } = parseCardExpiry(form.expiry);
      const brand = detectBeamCardBrand(digits);

      const alreadySaved = paymentMethods.find(
        (method) =>
          method.lastFour === digits.slice(-4) &&
          method.brand.toLowerCase() === brand &&
          method.expiryMonth === month &&
          method.expiryYear === year,
      );
      if (alreadySaved) {
        router.push('/user/credit');
        return;
      }

      const tokenized = await tokenizeCard({
        number: digits,
        expirationMonth: month,
        expirationYear: year,
        name: form.cardName.trim(),
      });

      const method = await addPaymentMethod({
        cardToken: tokenized.cardToken,
        brand: tokenized.brand,
        lastFour: tokenized.lastFour,
        expiryMonth: tokenized.expiryMonth,
        expiryYear: tokenized.expiryYear,
        isDefault: hasExistingCards ? isDefault : true,
      });

      if (!method) {
        setError('ไม่สามารถเพิ่มบัตรได้');
        return;
      }

      router.push('/user/credit');
    } catch (err) {
      setError(getAddCardErrorMessage(err));
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
            checked={hasExistingCards ? isDefault : true}
            disabled={!hasExistingCards || loadingPaymentMethods}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 accent-sop-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          ตั้งเป็นบัตรหลัก
        </label>
        {!hasExistingCards && !loadingPaymentMethods ? (
          <p className="sop-body-xs-regular text-sop-neutral-gray-400">
            บัตรใบแรกจะถูกตั้งเป็นบัตรหลักอัตโนมัติ
          </p>
        ) : null}

        <Button type="submit" fill loading={loading} disabled={loading}>
          บันทึกบัตร
        </Button>
      </form>
    </AccountLayout>
  );
}
