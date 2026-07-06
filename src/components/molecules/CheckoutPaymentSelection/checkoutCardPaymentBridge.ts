import {
  OmiseConfigurationError,
  parseCardExpiry,
  tokenizeCard,
  type TokenizeCardInput,
} from '@/lib/payment/omise';
import { cleanCardNumber } from './paymentFormat';

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

type CheckoutCardPaymentBridge = {
  getCardForm: () => CheckoutCardFormState;
  validateCardForm: () => boolean;
  tokenizeCardForCheckout: () => Promise<string>;
  clearCardForm: () => void;
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

  try {
    parseCardExpiry(form.expiry);
  } catch (error) {
    return error instanceof Error ? error.message : 'กรุณากรอกวันหมดอายุให้ถูกต้อง (MM/YY)';
  }

  return null;
}

export async function prepareCardPaymentToken(): Promise<string> {
  if (!bridge) {
    throw new Error('กรุณากรอกข้อมูลบัตรเครดิตให้ครบ');
  }

  const form = bridge.getCardForm();
  const validationError = validateCheckoutCardForm(form);
  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const token = await bridge.tokenizeCardForCheckout();
    bridge.clearCardForm();
    return token;
  } catch (error) {
    if (error instanceof OmiseConfigurationError) {
      throw error;
    }

    throw error instanceof Error
      ? error
      : new Error('ไม่สามารถสร้าง token บัตรได้ กรุณาตรวจสอบข้อมูลบัตร');
  }
}

export function createCheckoutCardPaymentBridge(handlers: {
  getCardForm: () => CheckoutCardFormState;
  clearCardForm: () => void;
}): CheckoutCardPaymentBridge {
  return {
    getCardForm: handlers.getCardForm,
    clearCardForm: handlers.clearCardForm,
    validateCardForm: () => validateCheckoutCardForm(handlers.getCardForm()) === null,
    tokenizeCardForCheckout: async () => tokenizeCard(buildTokenizeInput(handlers.getCardForm())),
  };
}
