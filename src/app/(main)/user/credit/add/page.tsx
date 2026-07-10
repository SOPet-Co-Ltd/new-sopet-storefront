'use client';

import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useEffect, useState } from 'react';
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
import {
  loadOmise,
  OmiseConfigurationError,
  parseCardExpiry,
  tokenizeCard,
} from '@/lib/payment/omise';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';

function getAddCardErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors[0]?.message ?? 'ไม่สามารถเพิ่มบัตรได้';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'ไม่สามารถเพิ่มบัตรได้';
}

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
  const { addPaymentMethod, paymentMethods, loading: loadingPaymentMethods } = usePaymentMethods();
  const hasExistingCards = paymentMethods.length > 0;
  const [cardForm, setCardForm] = useState<CheckoutCardFormState>(EMPTY_CHECKOUT_CARD_FORM);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadOmise().catch((err) => {
      if (err instanceof OmiseConfigurationError) {
        setError(err.message);
      }
    });
  }, []);

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
      const brand = detectCardBrand(digits);

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

      const token = await tokenizeCard({
        number: digits,
        expirationMonth: month,
        expirationYear: year,
        securityCode: form.cvv,
        name: form.cardName.trim(),
      });

      const method = await addPaymentMethod({
        omiseCardToken: token,
        brand,
        lastFour: digits.slice(-4),
        expiryMonth: month,
        expiryYear: year,
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
