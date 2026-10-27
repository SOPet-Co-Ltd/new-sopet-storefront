export const BEAM_API_BASE_URL = 'https://api.beamcheckout.com';
export const BEAM_CARD_TOKENS_PATH = '/client/v1/card-tokens';

export const BEAM_MERCHANT_ID_ENV = 'NEXT_PUBLIC_BEAM_MERCHANT_ID';
export const BEAM_PUBLISHABLE_KEY_ENV = 'NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY';

export type TokenizeCardInput = {
  number: string;
  expirationMonth: number;
  expirationYear: number;
  name: string;
};

export type TokenizedCard = {
  cardToken: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
};

type BeamCardTokenResponse = {
  id?: string;
  message?: string;
  error?: { message?: string } | string;
};

export class BeamConfigurationError extends Error {
  constructor(message = 'ระบบชำระเงินยังไม่พร้อม กรุณาติดต่อผู้ดูแลระบบ') {
    super(message);
    this.name = 'BeamConfigurationError';
  }
}

export function getBeamCredentials(): { merchantId: string; publishableKey: string } {
  const merchantId = process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY?.trim();
  if (!merchantId || !publishableKey) {
    throw new BeamConfigurationError();
  }
  return { merchantId, publishableKey };
}

function encodeBasicAuth(merchantId: string, publishableKey: string): string {
  return `Basic ${btoa(`${merchantId}:${publishableKey}`)}`;
}

/** Brand heuristic from PAN prefix (Visa / Mastercard / Amex / JCB). */
export function detectBeamCardBrand(pan: string): string {
  const digits = pan.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2(2[2-9]|[3-6]\d|7[01]|720)/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^35(2[89]|[3-8]\d)/.test(digits)) return 'jcb';
  return 'unknown';
}

export function parseCardExpiry(expiry: string): { month: number; year: number } {
  const [monthPart, yearPart] = expiry.split('/');
  const month = Number.parseInt(monthPart?.trim() ?? '', 10);
  const year = Number.parseInt(`20${yearPart?.trim() ?? ''}`, 10);

  if (!Number.isFinite(month) || !Number.isFinite(year)) {
    throw new Error('กรุณากรอกวันหมดอายุให้ถูกต้อง (MM/YY)');
  }

  return { month, year };
}

function resolveErrorMessage(body: BeamCardTokenResponse | null): string {
  const nested = typeof body?.error === 'string' ? body.error : body?.error?.message;
  return nested ?? body?.message ?? 'ไม่สามารถสร้าง token บัตรได้ กรุณาตรวจสอบข้อมูลบัตร';
}

/**
 * Exchanges card details for a Beam card token directly from the browser.
 * The PAN is never sent to SOPET GraphQL; only the token and display fields are returned.
 * The CVV is not part of Beam card tokenization — it is collected separately and sent with createPayment.
 */
export async function tokenizeCard(input: TokenizeCardInput): Promise<TokenizedCard> {
  const { merchantId, publishableKey } = getBeamCredentials();
  const pan = input.number.replace(/\D/g, '');

  const response = await fetch(`${BEAM_API_BASE_URL}${BEAM_CARD_TOKENS_PATH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: encodeBasicAuth(merchantId, publishableKey),
    },
    body: JSON.stringify({
      pan,
      expiryMonth: input.expirationMonth,
      expiryYear: input.expirationYear,
      cardHolderName: input.name.trim(),
    }),
  });

  const body = (await response.json().catch(() => null)) as BeamCardTokenResponse | null;

  if (!response.ok || !body?.id) {
    throw new Error(resolveErrorMessage(body));
  }

  return {
    cardToken: body.id,
    lastFour: pan.slice(-4),
    brand: detectBeamCardBrand(pan),
    expiryMonth: input.expirationMonth,
    expiryYear: input.expirationYear,
  };
}
