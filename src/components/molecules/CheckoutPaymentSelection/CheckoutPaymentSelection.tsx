'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { PlusIcon, QrCodeIcon, SubtractIcon, WalletIcon } from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { useCheckout, type PaymentMethod } from '@/lib/providers/CheckoutProvider';
import { cn } from '@/lib/utils';
import { CardPaymentForm } from './CardPaymentForm';
import {
  createCheckoutCardPaymentBridge,
  EMPTY_CHECKOUT_CARD_FORM,
  registerCheckoutCardPaymentBridge,
  type CheckoutCardFormState,
} from './checkoutCardPaymentBridge';
import { PaymentMethodRadio } from './PaymentMethodRadio';
import { SavedPaymentMethodOption } from './SavedPaymentMethodOption';

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
];

type CardEntryMode = 'saved' | 'new';

type PaymentMethodOptionProps = {
  value: PaymentMethod;
  selectedValue: PaymentMethod | null;
  label: string;
  icon: React.ReactNode;
  onChange: (method: PaymentMethod) => void;
};

function PaymentMethodOption({
  value,
  selectedValue,
  label,
  icon,
  onChange,
}: PaymentMethodOptionProps) {
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      data-testid={`payment-method-${value}`}
      onClick={() => onChange(value)}
      className={cn(
        'flex w-full items-center justify-between rounded-sop-16px border border-sop-neutral-grayalpha-200 bg-sop-base-white px-sop-24px py-sop-20px text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sop-neutral-grayalpha-100',
        'hover:bg-sop-primary-50',
      )}
    >
      <span className="flex items-center gap-sop-12px">
        <PaymentMethodRadio checked={isSelected} />
        <span className="sop-body-sm-regular text-sop-neutral-gray-200">{label}</span>
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">{icon}</span>
    </button>
  );
}

function resolveDefaultSavedCardId(
  paymentMethods: ReturnType<typeof usePaymentMethods>['paymentMethods'],
): string | null {
  if (paymentMethods.length === 0) {
    return null;
  }

  return paymentMethods.find((method) => method.isDefault)?.id ?? paymentMethods[0]?.id ?? null;
}

export function CheckoutPaymentSelection() {
  const { paymentMethod, setPaymentMethod } = useCheckout();
  const { isAuthenticated } = useAuth();
  const { paymentMethods } = usePaymentMethods();
  const [cardForm, setCardForm] = useState<CheckoutCardFormState>(EMPTY_CHECKOUT_CARD_FORM);
  const [cardFormError, setCardFormError] = useState<string | null>(null);
  const [cardEntryMode, setCardEntryMode] = useState<CardEntryMode>('new');
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);
  const [saveCardForNextTime, setSaveCardForNextTime] = useState(false);
  const cardFormRef = useRef(cardForm);
  const cardEntryModeRef = useRef(cardEntryMode);
  const selectedSavedCardIdRef = useRef(selectedSavedCardId);
  const saveCardForNextTimeRef = useRef(saveCardForNextTime);

  const hasSavedCards = isAuthenticated && paymentMethods.length > 0;
  const showSavedCards = paymentMethod === 'card' && hasSavedCards && cardEntryMode === 'saved';
  const showNewCardForm = paymentMethod === 'card' && !showSavedCards;

  useLayoutEffect(() => {
    cardFormRef.current = cardForm;
    cardEntryModeRef.current = cardEntryMode;
    selectedSavedCardIdRef.current = selectedSavedCardId;
    saveCardForNextTimeRef.current = saveCardForNextTime;
  }, [cardEntryMode, cardForm, saveCardForNextTime, selectedSavedCardId]);

  useEffect(() => {
    if (paymentMethod === null) {
      setPaymentMethod('promptpay');
    }
  }, [paymentMethod, setPaymentMethod]);

  useEffect(() => {
    if (!hasSavedCards) {
      setCardEntryMode('new');
      setSelectedSavedCardId(null);
      return;
    }

    const defaultCardId = resolveDefaultSavedCardId(paymentMethods);
    setSelectedSavedCardId((current) => current ?? defaultCardId);
  }, [hasSavedCards, paymentMethods]);

  const clearCardForm = useCallback(() => {
    setCardForm(EMPTY_CHECKOUT_CARD_FORM);
    setCardFormError(null);
    setSaveCardForNextTime(false);
  }, []);

  useEffect(() => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        getCardForm: () => cardFormRef.current,
        clearCardForm,
        getSavedPaymentMethodId: () => selectedSavedCardIdRef.current,
        shouldUseSavedCard: () =>
          cardEntryModeRef.current === 'saved' && Boolean(selectedSavedCardIdRef.current),
        getSaveCardForNextTime: () => saveCardForNextTimeRef.current,
      }),
    );

    return () => {
      registerCheckoutCardPaymentBridge(null);
    };
  }, [clearCardForm]);

  const handlePaymentMethodChange = useCallback(
    (method: PaymentMethod) => {
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
    [clearCardForm, hasSavedCards, paymentMethod, paymentMethods, setPaymentMethod],
  );

  const handleAddNewCard = useCallback(() => {
    setCardEntryMode('new');
    clearCardForm();
  }, [clearCardForm]);

  return (
    <div
      className="mb-sop-16px min-h-60 w-full rounded-sop-20 bg-sop-base-white p-sop-24px"
      data-testid="checkout-payment-selection"
    >
      <div className="flex items-center gap-sop-8px">
        <WalletIcon size={{ mobile: 24 }} color="#9C6ADE" />
        <h2 className="sop-body-lg-medium text-sop-primary-500">วิธีการชำระเงิน</h2>
      </div>

      <div className="mt-sop-16px flex flex-col gap-sop-20px">
        <div role="radiogroup" aria-label="วิธีการชำระเงิน" className="flex flex-col gap-sop-12px">
          {PAYMENT_OPTIONS.map((option) => (
            <PaymentMethodOption
              key={option.value}
              value={option.value}
              selectedValue={paymentMethod}
              label={option.label}
              icon={option.icon}
              onChange={handlePaymentMethodChange}
            />
          ))}
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
                    data-testid="checkout-add-new-card-button"
                    onClick={handleAddNewCard}
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
      </div>
    </div>
  );
}
