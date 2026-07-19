'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import {
  PlusIcon,
  QrCodeIcon,
  SubtractIcon,
  TruckIcon,
  WalletIcon,
} from '@/components/atoms/icons';
import { CardPaymentForm } from '@/components/molecules/CheckoutPaymentSelection/CardPaymentForm';
import {
  EMPTY_CHECKOUT_CARD_FORM,
  validateCheckoutCardForm,
  type CheckoutCardFormState,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';
import { PaymentMethodRadio } from '@/components/molecules/CheckoutPaymentSelection/PaymentMethodRadio';
import { cleanCardNumber } from '@/components/molecules/CheckoutPaymentSelection/paymentFormat';
import { SavedPaymentMethodOption } from '@/components/molecules/CheckoutPaymentSelection/SavedPaymentMethodOption';
import { mapCheckoutPaymentMethodForApi } from '@/lib/checkout/checkoutPaymentMethod';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { OmiseConfigurationError, parseCardExpiry, tokenizeCard } from '@/lib/payment/omise';
import type { PaymentMethod } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';

export type PaymentRetrySubmitInput = {
  paymentMethod: 'promptpay' | 'credit_card' | 'cod';
  omiseToken?: string;
  savedPaymentMethodId?: string;
};

export type PaymentRetryPanelProps = {
  /** Optional seed for invalid-option tests / rare re-entry; prefer user selection */
  initialPaymentMethod?: PaymentMethod | null;
  onSubmit?: (input: PaymentRetrySubmitInput) => void | Promise<void>;
  submitError?: string | null;
  /** Parent mutation in-flight (task-04 createPayment) */
  isSubmitting?: boolean;
};

type CardEntryMode = 'saved' | 'new';

type PaymentOption = {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
};

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: 'promptpay',
    label: 'QR Code / PromptPay',
    icon: <QrCodeIcon size={{ mobile: 28 }} color="#9C6ADE" />,
  },
  {
    value: 'card',
    label: 'บัตรเครดิต/บัตรเดบิต',
    icon: <SubtractIcon size={{ mobile: 28 }} color="#9C6ADE" />,
  },
  {
    value: 'cod',
    label: 'เก็บเงินปลายทาง',
    icon: <TruckIcon size={{ mobile: 28 }} color="#9C6ADE" />,
  },
];

function resolveDefaultSavedCardId(
  paymentMethods: ReturnType<typeof usePaymentMethods>['paymentMethods'],
): string | null {
  if (paymentMethods.length === 0) {
    return null;
  }

  return paymentMethods.find((method) => method.isDefault)?.id ?? paymentMethods[0]?.id ?? null;
}

export function PaymentRetryPanel({
  initialPaymentMethod = null,
  onSubmit,
  submitError = null,
  isSubmitting: externalSubmitting = false,
}: PaymentRetryPanelProps) {
  const { isAuthenticated } = useAuth();
  const { paymentMethods } = usePaymentMethods();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(initialPaymentMethod);
  const [cardForm, setCardForm] = useState<CheckoutCardFormState>(EMPTY_CHECKOUT_CARD_FORM);
  const [cardFormError, setCardFormError] = useState<string | null>(null);
  const [cardEntryMode, setCardEntryMode] = useState<CardEntryMode>('new');
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);
  const [saveCardForNextTime, setSaveCardForNextTime] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSubmitting = externalSubmitting || localSubmitting;
  const hasSavedCards = isAuthenticated && paymentMethods.length > 0;
  const showSavedCards = paymentMethod === 'card' && hasSavedCards && cardEntryMode === 'saved';
  const showNewCardForm = paymentMethod === 'card' && !showSavedCards;
  const displayError = localError ?? submitError;

  const clearCardForm = useCallback(() => {
    setCardForm(EMPTY_CHECKOUT_CARD_FORM);
    setCardFormError(null);
    setSaveCardForNextTime(false);
  }, []);

  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethod) => {
      setLocalError(null);
      setCardFormError(null);

      if (method === 'card') {
        if (hasSavedCards) {
          setCardEntryMode('saved');
          setSelectedSavedCardId((current) => current ?? resolveDefaultSavedCardId(paymentMethods));
        } else {
          setCardEntryMode('new');
        }
      } else if (paymentMethod === 'card') {
        clearCardForm();
        setCardEntryMode('new');
        setSelectedSavedCardId(null);
      }

      setPaymentMethod(method);
    },
    [clearCardForm, hasSavedCards, paymentMethod, paymentMethods],
  );

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setLocalError(null);
    setCardFormError(null);

    if (paymentMethod === null) {
      setLocalError('กรุณาเลือกวิธีการชำระเงิน');
      return;
    }

    let apiPaymentMethod: PaymentRetrySubmitInput['paymentMethod'];
    try {
      apiPaymentMethod = mapCheckoutPaymentMethodForApi(paymentMethod);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'ไม่รองรับวิธีการชำระเงินที่เลือก');
      return;
    }

    const payload: PaymentRetrySubmitInput = { paymentMethod: apiPaymentMethod };

    if (paymentMethod === 'card') {
      if (cardEntryMode === 'saved' && selectedSavedCardId) {
        payload.savedPaymentMethodId = selectedSavedCardId;
      } else {
        const validationError = validateCheckoutCardForm(cardForm);
        if (validationError) {
          setCardFormError(validationError);
          return;
        }

        try {
          const { month, year } = parseCardExpiry(cardForm.expiry);
          payload.omiseToken = await tokenizeCard({
            number: cleanCardNumber(cardForm.cardNumber),
            expirationMonth: month,
            expirationYear: year,
            securityCode: cardForm.cvv,
            name: cardForm.cardName.trim(),
          });
          clearCardForm();
        } catch (error) {
          const message =
            error instanceof OmiseConfigurationError
              ? error.message
              : error instanceof Error
                ? error.message
                : 'ไม่สามารถสร้าง token บัตรได้ กรุณาตรวจสอบข้อมูลบัตร';
          setCardFormError(message);
          return;
        }
      }
    }

    setLocalSubmitting(true);
    try {
      await onSubmit?.(payload);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'ไม่สามารถสร้างการชำระเงินได้');
    } finally {
      setLocalSubmitting(false);
    }
  }, [
    cardEntryMode,
    cardForm,
    clearCardForm,
    isSubmitting,
    onSubmit,
    paymentMethod,
    selectedSavedCardId,
  ]);

  return (
    <div
      className="mt-4 w-full rounded-sop-20 border border-sop-neutral-grayalpha-200 bg-sop-base-white p-sop-24px"
      data-testid="payment-retry-panel"
    >
      <div className="flex items-center gap-sop-8px">
        <WalletIcon size={{ mobile: 24 }} color="#9C6ADE" />
        <h2 className="sop-body-lg-medium text-gray-900">เลือกวิธีชำระเงินใหม่</h2>
      </div>

      <div className="mt-sop-16px flex flex-col gap-sop-20px">
        <div role="radiogroup" aria-label="วิธีการชำระเงิน" className="flex flex-col gap-sop-12px">
          {PAYMENT_OPTIONS.map((option) => {
            const isSelected = paymentMethod === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={option.label}
                data-testid={`payment-method-${option.value}`}
                disabled={isSubmitting}
                onClick={() => handlePaymentMethodChange(option.value)}
                className={cn(
                  'flex w-full items-center justify-between rounded-sop-16px border border-sop-neutral-grayalpha-200 bg-sop-base-white px-sop-24px py-sop-20px text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sop-neutral-grayalpha-100',
                  'hover:bg-sop-primary-50 disabled:cursor-not-allowed disabled:opacity-60',
                )}
              >
                <span className="flex items-center gap-sop-12px">
                  <PaymentMethodRadio checked={isSelected} />
                  <span className="sop-body-sm-regular text-sop-neutral-gray-200">
                    {option.label}
                  </span>
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                  {option.icon}
                </span>
              </button>
            );
          })}
        </div>

        {paymentMethod === 'card' ? (
          <>
            <div className="h-px w-full bg-sop-neutral-grayalpha-200" />

            {showSavedCards ? (
              <div className="flex flex-col gap-sop-20px">
                <div className="flex items-center justify-between gap-sop-12px">
                  <p className="sop-body-md-regular text-sop-neutral-gray-300">บัตรที่บันทึกไว้</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    rounded="full"
                    disabled={isSubmitting}
                    data-testid="retry-add-new-card-button"
                    onClick={() => {
                      setCardEntryMode('new');
                      clearCardForm();
                    }}
                    className="h-8 border-sop-secondary-500 px-sop-20px text-sop-secondary-500 hover:bg-sop-secondary-50"
                    iconLeft={<PlusIcon size={{ mobile: 16 }} color="#FF6F61" />}
                  >
                    เพิ่มบัตรใหม่
                  </Button>
                </div>

                <div
                  role="radiogroup"
                  aria-label="บัตรที่บันทึกไว้"
                  className="flex flex-col gap-sop-12px"
                >
                  {paymentMethods.map((method) => (
                    <SavedPaymentMethodOption
                      key={method.id}
                      method={method}
                      selected={selectedSavedCardId === method.id}
                      onSelect={() => setSelectedSavedCardId(method.id)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {showNewCardForm ? (
              <div className="flex flex-col gap-sop-20px">
                <p className="sop-body-md-regular text-sop-neutral-gray-300">ข้อมูลบัตรของคุณ</p>
                <CardPaymentForm
                  value={cardForm}
                  onChange={(next) => {
                    setCardForm(next);
                    if (cardFormError) {
                      setCardFormError(null);
                    }
                  }}
                  error={cardFormError}
                  showSaveCardCheckbox={isAuthenticated}
                  saveCardChecked={saveCardForNextTime}
                  onSaveCardChange={setSaveCardForNextTime}
                />
              </div>
            ) : null}
          </>
        ) : null}

        {displayError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-3"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm text-red-600">{displayError}</p>
          </div>
        ) : null}

        <Button
          type="button"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={() => {
            void handleSubmit();
          }}
        >
          ยืนยันการชำระเงิน
        </Button>
      </div>
    </div>
  );
}
