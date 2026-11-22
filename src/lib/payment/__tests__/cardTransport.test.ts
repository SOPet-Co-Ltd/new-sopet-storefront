import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CARD_TRANSPORT_PREFIX,
  encryptCardSecurityCodeTransport,
  encryptCardTransportPayload,
  resetCardTransportPublicKeyCache,
} from '@/lib/payment/cardTransport';

function pemFromSpkiDer(spkiDer: ArrayBuffer): string {
  const bytes = new Uint8Array(spkiDer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const b64 = btoa(binary);
  const lines = b64.match(/.{1,64}/g) ?? [];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

describe('cardTransport', () => {
  beforeEach(() => {
    resetCardTransportPublicKeyCache();
  });

  afterEach(() => {
    resetCardTransportPublicKeyCache();
    vi.unstubAllGlobals();
  });

  it('encrypts card payload and CVV as rsa:v1 ciphertext without plaintext digits', async () => {
    const pair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );
    const spki = await crypto.subtle.exportKey('spki', pair.publicKey);
    const pem = pemFromSpkiDer(spki);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { cardTransportPublicKey: pem } }),
      }),
    );

    const cardCipher = await encryptCardTransportPayload({
      cardholderName: 'Test User',
      pan: '4242-4242-4242-4242',
      expiryMonth: 12,
      expiryYear: 2030,
    });
    const cvvCipher = await encryptCardSecurityCodeTransport('123');

    expect(cardCipher.startsWith(CARD_TRANSPORT_PREFIX)).toBe(true);
    expect(cvvCipher.startsWith(CARD_TRANSPORT_PREFIX)).toBe(true);
    expect(cardCipher).not.toContain('4242424242424242');
    expect(cvvCipher).not.toContain('123');
  });
});
