import {
  OmiseConfigurationError,
  parseCardExpiry,
  tokenizeCard,
  type TokenizeCardInput,
} from '@/lib/payment/omise';
import {
  cleanCardNumber,
  getCvvLength,
  isCompleteCardNumber,
  isCompleteExpiry,
  isExpiryDateValid,
  isValidCardNumberLuhn,
  isValidCvv,
} from './paymentFormat';

export type CheckoutCardFormState = {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
};

export const EMPTY_CHECKOUT_CARD_FORM: CheckoutCardFormState = {
  cardNumber: '',
  cardName: '',
  expiry: '',
  cvv: '',
};

export type CardPaymentPayload =
  | {
      type: 'token';
      omiseToken: string;
      saveCardForNextTime: boolean;
      cardForm: CheckoutCardFormState;
    }
  | { type: 'saved'; savedPaymentMethodId: string };

type CheckoutCardPaymentBridge = {
  getCardForm: () => CheckoutCardFormState;
  validateCardForm: () => boolean;
  tokenizeCardForCheckout: () => Promise<string>;
  clearCardForm: () => void;
  getSavedPaymentMethodId: () => string | null;
  shouldUseSavedCard: () => boolean;
  getSaveCardForNextTime: () => boolean;
};

let bridge: CheckoutCardPaymentBridge | null = null;

type CardPaymentValidityListener = () => void;
const cardPaymentValidityListeners = new Set<CardPaymentValidityListener>();

export function subscribeCheckoutCardPaymentValidity(
  listener: CardPaymentValidityListener,
): () => void {
  cardPaymentValidityListeners.add(listener);
  return () => {
    cardPaymentValidityListeners.delete(listener);
  };
}

export function notifyCheckoutCardPaymentValidityChange(): void {
  for (const listener of cardPaymentValidityListeners) {
    listener();
  }
}

export function registerCheckoutCardPaymentBridge(next: CheckoutCardPaymentBridge | null): void {
  bridge = next;
  notifyCheckoutCardPaymentValidityChange();
}

export function isCheckoutCardPaymentReady(): boolean {
  if (!bridge) {
    return true;
  }

  if (bridge.shouldUseSavedCard()) {
    return Boolean(bridge.getSavedPaymentMethodId());
  }

  return bridge.validateCardForm();
}

export type CheckoutCardFieldErrors = Partial<
  Record<keyof CheckoutCardFormState, string | null | undefined>
>;

export function getCheckoutCardFieldErrors(
  form: CheckoutCardFormState,
  options?: { showEmptyRequired?: boolean },
): CheckoutCardFieldErrors {
  const errors: CheckoutCardFieldErrors = {};
  const cardDigits = cleanCardNumber(form.cardNumber);

  if (!cardDigits) {
    if (options?.showEmptyRequired) {
      errors.cardNumber = 'กรุณากรอกหมายเลขบัตร';
    }
  } else if (isCompleteCardNumber(form.cardNumber) && !isValidCardNumberLuhn(form.cardNumber)) {
    errors.cardNumber = 'หมายเลขบัตรไม่ถูกต้อง';
  }

  if (!form.cardName.trim()) {
    if (options?.showEmptyRequired) {
      errors.cardName = 'กรุณากรอกชื่อบนบัตร';
    }
  }

  const expiry = form.expiry.trim();
  if (!expiry) {
    if (options?.showEmptyRequired) {
      errors.expiry = 'กรุณากรอกวันหมดอายุ';
    }
  } else if (isCompleteExpiry(expiry)) {
    if (!isExpiryDateValid(expiry)) {
      errors.expiry = 'บัตรหมดอายุแล้ว กรุณาใช้บัตรอื่น';
    }
  } else if (expiry.length >= 4) {
    errors.expiry = 'กรุณากรอกวันหมดอายุให้ถูกต้อง (MM/YY)';
  }

  const cvvDigits = form.cvv.replace(/\D/g, '');
  if (!cvvDigits) {
    if (options?.showEmptyRequired) {
      errors.cvv = 'กรุณากรอกรหัส CVV';
    }
  } else if (!isValidCvv(form.cvv, form.cardNumber)) {
    const cvvLength = getCvvLength(form.cardNumber);
    errors.cvv = cvvLength === 4 ? 'กรุณากรอกรหัส CVV 4 หลัก' : 'กรุณากรอกรหัส CVV 3 หลัก';
  }

  return errors;
}

function buildTokenizeInput(form: CheckoutCardFormState): TokenizeCardInput {
  const { month, year } = parseCardExpiry(form.expiry);

  return {
    number: cleanCardNumber(form.cardNumber),
    expirationMonth: month,
    expirationYear: year,
    securityCode: form.cvv,
    name: form.cardName.trim(),
  };
}

export function validateCheckoutCardForm(form: CheckoutCardFormState): string | null {
  const fieldErrors = getCheckoutCardFieldErrors(form, { showEmptyRequired: true });
  const firstError =
    fieldErrors.cardNumber ?? fieldErrors.cardName ?? fieldErrors.expiry ?? fieldErrors.cvv ?? null;

  if (firstError) {
    return firstError;
  }

  if (!isCompleteCardNumber(form.cardNumber) || !isValidCardNumberLuhn(form.cardNumber)) {
    return 'หมายเลขบัตรไม่ถูกต้อง';
  }

  if (!isCompleteExpiry(form.expiry) || !isExpiryDateValid(form.expiry)) {
    return 'กรุณากรอกวันหมดอายุให้ถูกต้อง (MM/YY)';
  }

  try {
    parseCardExpiry(form.expiry);
  } catch (error) {
    return error instanceof Error ? error.message : 'กรุณากรอกวันหมดอายุให้ถูกต้อง (MM/YY)';
  }

  return null;
}

export async function prepareCardPayment(): Promise<CardPaymentPayload> {
  if (!bridge) {
    throw new Error('กรุณากรอกข้อมูลบัตรเครดิตให้ครบ');
  }

  if (bridge.shouldUseSavedCard()) {
    const savedPaymentMethodId = bridge.getSavedPaymentMethodId();
    if (!savedPaymentMethodId) {
      throw new Error('กรุณาเลือกบัตรที่บันทึกไว้');
    }

    return { type: 'saved', savedPaymentMethodId };
  }

  const form = bridge.getCardForm();
  const validationError = validateCheckoutCardForm(form);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const omiseToken = await bridge.tokenizeCardForCheckout();
    const saveCardForNextTime = bridge.getSaveCardForNextTime();
    const cardForm = bridge.getCardForm();
    return { type: 'token', omiseToken, saveCardForNextTime, cardForm };
  } catch (error) {
    if (error instanceof OmiseConfigurationError) {
      throw error;
    }

    throw error instanceof Error
      ? error
      : new Error('ไม่สามารถสร้าง token บัตรได้ กรุณาตรวจสอบข้อมูลบัตร');
  }
}

export async function prepareCardPaymentToken(): Promise<string> {
  const payload = await prepareCardPayment();
  if (payload.type !== 'token') {
    throw new Error('กรุณากรอกข้อมูลบัตรเครดิตให้ครบ');
  }

  return payload.omiseToken;
}

export function createCheckoutCardPaymentBridge(handlers: {
  getCardForm: () => CheckoutCardFormState;
  clearCardForm: () => void;
  getSavedPaymentMethodId: () => string | null;
  shouldUseSavedCard: () => boolean;
  getSaveCardForNextTime: () => boolean;
}): CheckoutCardPaymentBridge {
  return {
    getCardForm: handlers.getCardForm,
    clearCardForm: handlers.clearCardForm,
    getSavedPaymentMethodId: handlers.getSavedPaymentMethodId,
    shouldUseSavedCard: handlers.shouldUseSavedCard,
    getSaveCardForNextTime: handlers.getSaveCardForNextTime,
    validateCardForm: () => validateCheckoutCardForm(handlers.getCardForm()) === null,
    tokenizeCardForCheckout: async () => tokenizeCard(buildTokenizeInput(handlers.getCardForm())),
  };
}
