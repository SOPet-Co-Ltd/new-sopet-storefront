import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getOmisePublicKey,
  loadOmise,
  OmiseConfigurationError,
  parseCardExpiry,
  resetOmiseLoaderForTests,
  tokenizeCard,
} from '@/lib/payment/omise';
import {
  createCheckoutCardPaymentBridge,
  prepareCardPaymentToken,
  registerCheckoutCardPaymentBridge,
} from '@/components/molecules/CheckoutPaymentSelection/checkoutCardPaymentBridge';

const VALID_CARD_FORM = {
  cardNumber: '4242-4242-4242-4242',
  cardName: 'Test User',
  expiry: '12/30',
  cvv: '123',
};

describe('omise payment utilities', () => {
  const originalPublicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;

  beforeEach(() => {
    resetOmiseLoaderForTests();
    process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY = 'pkey_test_123';
    document.head.innerHTML = '';
    delete window.Omise;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY = originalPublicKey;
    registerCheckoutCardPaymentBridge(null);
    vi.restoreAllMocks();
  });

  it('throws OmiseConfigurationError when public key is missing', () => {
    delete process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY;

    expect(() => getOmisePublicKey()).toThrow(OmiseConfigurationError);
    expect(() => getOmisePublicKey()).toThrow(
      'ระบบชำระเงินยังไม่พร้อม กรุณาติดต่อผู้ดูแลระบบ',
    );
  });

  it('loads Omise.js and tokenizes card data into a token id', async () => {
    const createToken = vi.fn(
      (
        _type: 'card',
        _data: Record<string, unknown>,
        callback: (statusCode: number, response: { id?: string }) => void,
      ) => {
        callback(200, { id: 'tokn_test_abc' });
      },
    );

    window.Omise = {
      setPublicKey: vi.fn(),
      createToken,
    };

    const token = await tokenizeCard({
      number: '4242424242424242',
      expirationMonth: 12,
      expirationYear: 2030,
      securityCode: '123',
      name: 'Test User',
    });

    expect(token).toBe('tokn_test_abc');
    expect(window.Omise?.setPublicKey).toHaveBeenCalledWith('pkey_test_123');
    expect(createToken).toHaveBeenCalledWith(
      'card',
      expect.objectContaining({
        number: '4242424242424242',
        expiration_month: 12,
        expiration_year: 2030,
        security_code: '123',
        name: 'Test User',
      }),
      expect.any(Function),
    );
  });

  it('rejects tokenization when Omise returns a non-200 response', async () => {
    window.Omise = {
      setPublicKey: vi.fn(),
      createToken: (_type, _data, callback) => {
        callback(422, { message: 'invalid card' });
      },
    };

    await expect(
      tokenizeCard({
        number: '4242424242424242',
        expirationMonth: 12,
        expirationYear: 2030,
        securityCode: '123',
        name: 'Test User',
      }),
    ).rejects.toThrow('invalid card');
  });

  it('loads Omise.js script when window.Omise is not yet available', async () => {
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    const loadPromise = loadOmise();

    const script = appendChildSpy.mock.calls.find(
      ([node]) => node instanceof HTMLScriptElement,
    )?.[0] as HTMLScriptElement | undefined;

    expect(script?.src).toBe('https://cdn.omise.co/omise.js');

    window.Omise = {
      setPublicKey: vi.fn(),
      createToken: vi.fn(),
    };

    script?.onload?.(new Event('load'));

    await expect(loadPromise).resolves.toBe(window.Omise);
  });

  it('parses MM/YY expiry into month and year', () => {
    expect(parseCardExpiry('12/30')).toEqual({ month: 12, year: 2030 });
  });
});

describe('checkout card payment bridge', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY = 'pkey_test_123';
    resetOmiseLoaderForTests();
    window.Omise = {
      setPublicKey: vi.fn(),
      createToken: (_type, _data, callback) => {
        callback(200, { id: 'tokn_test_bridge' });
      },
    };
  });

  afterEach(() => {
    registerCheckoutCardPaymentBridge(null);
  });

  it('tokenizes card form data through prepareCardPaymentToken and clears the form', async () => {
    let form = { ...VALID_CARD_FORM };

    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        getCardForm: () => form,
        clearCardForm: () => {
          form = {
            cardNumber: '',
            cardName: '',
            expiry: '',
            cvv: '',
          };
        },
      }),
    );

    const token = await prepareCardPaymentToken();

    expect(token).toBe('tokn_test_bridge');
    expect(form).toEqual({
      cardNumber: '',
      cardName: '',
      expiry: '',
      cvv: '',
    });
  });

  it('throws validation error when card form is incomplete', async () => {
    registerCheckoutCardPaymentBridge(
      createCheckoutCardPaymentBridge({
        getCardForm: () => ({
          cardNumber: '',
          cardName: '',
          expiry: '',
          cvv: '',
        }),
        clearCardForm: vi.fn(),
      }),
    );

    await expect(prepareCardPaymentToken()).rejects.toThrow('กรุณากรอกหมายเลขบัตร');
  });
});
