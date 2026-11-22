import { GRAPHQL_URL } from '@/lib/config';

export const CARD_TRANSPORT_PREFIX = 'rsa:v1:';

export type CardTransportPlainPayload = {
  cardholderName: string;
  pan: string;
  expiryMonth: number;
  expiryYear: number;
};

type CardTransportPublicKeyQuery = {
  data?: { cardTransportPublicKey?: string };
  errors?: Array<{ message?: string }>;
};

let publicKeyPromise: Promise<CryptoKey> | null = null;

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'spki',
    pemToArrayBuffer(pem),
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );
}

async function fetchPublicKeyPem(): Promise<string> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: 'query CardTransportPublicKey { cardTransportPublicKey }',
    }),
  });

  const body = (await response.json().catch(() => null)) as CardTransportPublicKeyQuery | null;
  const pem = body?.data?.cardTransportPublicKey?.trim();
  if (!response.ok || !pem) {
    const message = body?.errors?.[0]?.message ?? 'ระบบเข้ารหัสบัตรยังไม่พร้อม';
    throw new Error(message);
  }
  return pem;
}

async function getPublicKey(): Promise<CryptoKey> {
  if (!publicKeyPromise) {
    publicKeyPromise = fetchPublicKeyPem()
      .then((pem) => importPublicKey(pem))
      .catch((error) => {
        publicKeyPromise = null;
        throw error;
      });
  }
  return publicKeyPromise;
}

async function encryptUtf8(plaintext: string): Promise<string> {
  const key = await getPublicKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    new TextEncoder().encode(plaintext),
  );
  return `${CARD_TRANSPORT_PREFIX}${bufferToBase64Url(encrypted)}`;
}

/** Encrypt card fields for GraphQL — PAN never leaves the browser in plaintext toward SOPET. */
export async function encryptCardTransportPayload(
  input: CardTransportPlainPayload,
): Promise<string> {
  const pan = input.pan.replace(/\D/g, '');
  return encryptUtf8(
    JSON.stringify({
      cardholderName: input.cardholderName.trim(),
      pan,
      expiryMonth: input.expiryMonth,
      expiryYear: input.expiryYear,
    }),
  );
}

/** Encrypt CVV for createPayment.cardSecurityCodeCipher. */
export async function encryptCardSecurityCodeTransport(cvv: string): Promise<string> {
  const digits = cvv.replace(/\D/g, '');
  if (!/^\d{3,4}$/.test(digits)) {
    throw new Error('รหัส CVV ไม่ถูกต้อง');
  }
  return encryptUtf8(digits);
}

/** Test helper to clear the cached public key between cases. */
export function resetCardTransportPublicKeyCache(): void {
  publicKeyPromise = null;
}
