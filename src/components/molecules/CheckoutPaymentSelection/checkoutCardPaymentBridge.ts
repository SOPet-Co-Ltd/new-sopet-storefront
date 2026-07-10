import {
  OmiseConfigurationError,
  parseCardExpiry,
  tokenizeCard,
  type TokenizeCardInput,
} from '@/lib/payment/omise';
import { cleanCardNumber, getCvvLength, isValidCvv } from './paymentFormat';

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
  | { type: 'token'; omiseToken: string }
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

export function registerCheckoutCardPaymentBridge(
  next: CheckoutCardPaymentBridge | null,
): void {
  bridge = next;
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
  if (!cleanCardNumber(form.cardNumber)) {
    return 'กรุณากรอกหมายเลขบัตร';
  }

  if (!form.cardName.trim()) {
    return 'กรุณากรอกชื่อบนบัตร';
  }

  if (!form.expiry.trim()) {
    return 'กรุณากรอกวันหมดอายุ';
  }

  if (!form.cvv.trim()) {
    return 'กรุณากรอกรหัส CVV';
  }

  if (!isValidCvv(form.cvv, form.cardNumber)) {
    const cvvLength = getCvvLength(form.cardNumber);
    return cvvLength === 4
      ? 'กรุณากรอกรหัส CVV 4 หลัก'
      : 'กรุณากรอกรหัส CVV 3 หลัก';
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
    bridge.clearCardForm();
    return { type: 'token', omiseToken };
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
