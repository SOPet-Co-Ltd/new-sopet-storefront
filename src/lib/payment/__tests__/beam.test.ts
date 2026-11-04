import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BeamConfigurationError,
  detectBeamCardBrand,
  getBeamApiBaseUrl,
  getBeamCredentials,
  parseCardExpiry,
  toBeamExpiryYearYy,
  tokenizeCard,
} from '@/lib/payment/beam';
import {
  createCheckoutCardPaymentBridge,
  isCheckoutCardPaymentReady,
  prepareCardPayment,
  prepareCardPaymentToken,
  registerCheckoutCardPaymentBridge,
  validateCheckoutCardForm,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';

const VALID_CARD_FORM = {
  cardNumber: '4242-4242-4242-4242',
  cardName: 'Test User',
  expiry: '12/30',
  cvv: '123',
};

const TOKEN_INPUT = {
  number: '4242 4242 4242 4242',
  expirationMonth: 12,
  expirationYear: 2030,
  name: ' Test User ',
};

function jsonResponse(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('beam payment utilities', () => {
  const originalMerchantId = process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID;
  const originalPublishableKey = process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY;
  const originalApiBaseUrl = process.env.NEXT_PUBLIC_BEAM_API_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID = 'merchant_test';
    process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY = 'pk_test_123';
    delete process.env.NEXT_PUBLIC_BEAM_API_BASE_URL;
  });

  afterEach(() => {
    if (originalMerchantId === undefined) {
      delete process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID;
    } else {
      process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID = originalMerchantId;
    }
    if (originalPublishableKey === undefined) {
      delete process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY = originalPublishableKey;
    }
    if (originalApiBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BEAM_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_BEAM_API_BASE_URL = originalApiBaseUrl;
    }
    registerCheckoutCardPaymentBridge(null);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('throws BeamConfigurationError when merchant id or publishable key is missing', () => {
    delete process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY;
    expect(() => getBeamCredentials()).toThrow(BeamConfigurationError);
    expect(() => getBeamCredentials()).toThrow('ระบบชำระเงินยังไม่พร้อม กรุณาติดต่อผู้ดูแลระบบ');

    process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY = 'pk_test_123';
    delete process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID;
    expect(() => getBeamCredentials()).toThrow(BeamConfigurationError);
  });

  it('does not call fetch when Beam env is missing', async () => {
    delete process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID;
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(tokenizeCard(TOKEN_INPUT)).rejects.toBeInstanceOf(BeamConfigurationError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('tokenizes via Beam card-tokens with Basic auth, YY expiry, and full YYYY locally', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'beam_tok_123' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await tokenizeCard(TOKEN_INPUT);

    expect(result).toEqual({
      cardToken: 'beam_tok_123',
      lastFour: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2030,
    });
    expect(toBeamExpiryYearYy(2030)).toBe(30);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.beamcheckout.com/client/v1/card-tokens');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      `Basic ${btoa('merchant_test:pk_test_123')}`,
    );
    expect(JSON.parse(init.body as string)).toEqual({
      pan: '4242424242424242',
      expiryMonth: 12,
      expiryYear: 30,
      cardHolderName: 'Test User',
    });
  });

  it('uses NEXT_PUBLIC_BEAM_API_BASE_URL when set', async () => {
    process.env.NEXT_PUBLIC_BEAM_API_BASE_URL = 'https://playground.api.beamcheckout.com';
    expect(getBeamApiBaseUrl()).toBe('https://playground.api.beamcheckout.com');

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ id: 'beam_tok_pg' }));
    vi.stubGlobal('fetch', fetchMock);

    await tokenizeCard(TOKEN_INPUT);

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://playground.api.beamcheckout.com/client/v1/card-tokens');
  });

  it('rejects when Beam returns a non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Invalid card' }, { status: 400 })),
    );

    await expect(tokenizeCard(TOKEN_INPUT)).rejects.toThrow('Invalid card');
  });

  it('rejects with a default message when Beam response has no token id', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})));

    await expect(tokenizeCard(TOKEN_INPUT)).rejects.toThrow(
      'ไม่สามารถสร้าง token บัตรได้ กรุณาตรวจสอบข้อมูลบัตร',
    );
  });

  it('detects Visa, Mastercard, Amex, and JCB brands from PAN prefixes', () => {
    expect(detectBeamCardBrand('4111111111111111')).toBe('visa');
    expect(detectBeamCardBrand('5555555555554444')).toBe('mastercard');
    expect(detectBeamCardBrand('2221000000000009')).toBe('mastercard');
    expect(detectBeamCardBrand('378282246310005')).toBe('amex');
    expect(detectBeamCardBrand('3530111333300000')).toBe('jcb');
    expect(detectBeamCardBrand('9999999999999999')).toBe('unknown');
  });

  it('parses MM/YY expiry into month and year', () => {
    expect(parseCardExpiry('12/30')).toEqual({ month: 12, year: 2030 });
  });
});

describe('checkout card payment bridge', () => {
  const savedHandlers = {
    getSavedCardCvv: () => '',
    getSavedPaymentMethodId: () => null as string | null,
    shouldUseSavedCard: () => false,
    getSaveCardForNextTime: () => false,
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BEAM_MERCHANT_ID = 'merchant_test';
    process.env.NEXT_PUBLIC_BEAM_PUBLISHABLE_KEY = 'pk_test_123';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => jsonResponse({ id: 'beam_tok_bridge' })),
    );
  });

  afterEach(() => {
    registerCheckoutCardPaymentBridge(null);
    vi.unstubAllGlobals();
  });

  it('tokenizes card form data and returns cardToken + cardSecurityCode without clearing the form', async () => {
    let form = { ...VALID_CARD_FORM };

    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        ...savedHandlers,
        getCardForm: () => form,
        clearCardForm: () => {
          form = { cardNumber: '', cardName: '', expiry: '', cvv: '' };
        },
      }),
    );

    const payload = await prepareCardPayment();

    expect(payload).toMatchObject({
      type: 'token',
      cardToken: 'beam_tok_bridge',
      cardSecurityCode: '123',
      tokenizedCard: { lastFour: '4242', brand: 'visa', expiryMonth: 12, expiryYear: 2030 },
    });
    await expect(prepareCardPaymentToken()).resolves.toBe('beam_tok_bridge');
    expect(form).toEqual(VALID_CARD_FORM);
  });

  it('never sends the CVV to Beam tokenization', async () => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        ...savedHandlers,
        getCardForm: () => VALID_CARD_FORM,
        clearCardForm: vi.fn(),
      }),
    );

    await prepareCardPayment();

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(init.body as string).not.toContain('123');
    expect(init.body as string).not.toContain('securityCode');
  });

  it('throws validation error when card form is incomplete', async () => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        ...savedHandlers,
        getCardForm: () => ({ cardNumber: '', cardName: '', expiry: '', cvv: '' }),
        clearCardForm: vi.fn(),
      }),
    );

    await expect(prepareCardPaymentToken()).rejects.toThrow('กรุณากรอกหมายเลขบัตร');
  });

  it('rejects Visa CVV that is not exactly 3 digits', async () => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        ...savedHandlers,
        getCardForm: () => ({ ...VALID_CARD_FORM, cvv: '12' }),
        clearCardForm: vi.fn(),
      }),
    );

    await expect(prepareCardPaymentToken()).rejects.toThrow('กรุณากรอกรหัส CVV 3 หลัก');
  });

  it('rejects American Express CVV that is not exactly 4 digits', () => {
    expect(
      validateCheckoutCardForm({
        cardNumber: '3782-822463-10005',
        cardName: 'Test User',
        expiry: '12/30',
        cvv: '123',
      }),
    ).toBe('กรุณากรอกรหัส CVV 4 หลัก');
  });

  it('requires CVV for a saved card and returns it with the saved payment method id', async () => {
    let cvv = '';

    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        getCardForm: () => VALID_CARD_FORM,
        clearCardForm: vi.fn(),
        getSavedPaymentMethodId: () => 'saved-card-1',
        getSavedCardCvv: () => cvv,
        shouldUseSavedCard: () => true,
        getSaveCardForNextTime: () => false,
      }),
    );

    expect(isCheckoutCardPaymentReady()).toBe(false);
    await expect(prepareCardPayment()).rejects.toThrow('กรุณากรอกรหัส CVV ของบัตรที่บันทึกไว้');

    cvv = '12';
    await expect(prepareCardPayment()).rejects.toThrow('กรุณากรอกรหัส CVV ของบัตรที่บันทึกไว้');

    cvv = '456';
    expect(isCheckoutCardPaymentReady()).toBe(true);
    await expect(prepareCardPayment()).resolves.toEqual({
      type: 'saved',
      savedPaymentMethodId: 'saved-card-1',
      cardSecurityCode: '456',
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
