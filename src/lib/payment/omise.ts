export const OMISE_SCRIPT_SRC = 'https://cdn.omise.co/omise.js';

export const OMISE_PUBLIC_KEY_ENV = 'NEXT_PUBLIC_OMISE_PUBLIC_KEY';

export type TokenizeCardInput = {
  number: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
  name: string;
};

type OmiseTokenResponse = {
  id?: string;
  message?: string;
};

type OmiseClient = {
  setPublicKey: (key: string) => void;
  createToken: (
    type: 'card',
    data: {
      name: string;
      number: string;
      expiration_month: number;
      expiration_year: number;
      security_code: string;
    },
    callback: (statusCode: number, response: OmiseTokenResponse) => void,
  ) => void;
};

declare global {
  interface Window {
    Omise?: OmiseClient;
  }
}

export class OmiseConfigurationError extends Error {
  constructor(message = 'ระบบชำระเงินยังไม่พร้อม กรุณาติดต่อผู้ดูแลระบบ') {
    super(message);
    this.name = 'OmiseConfigurationError';
  }
}

export function getOmisePublicKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY?.trim();
  if (!publicKey) {
    throw new OmiseConfigurationError();
  }
  return publicKey;
}

let loadOmisePromise: Promise<OmiseClient> | null = null;

export async function loadOmise(): Promise<OmiseClient> {
  if (typeof window === 'undefined') {
    throw new Error('Omise.js can only be loaded in the browser');
  }

  const publicKey = getOmisePublicKey();

  if (window.Omise) {
    window.Omise.setPublicKey(publicKey);
    return window.Omise;
  }

  if (!loadOmisePromise) {
    loadOmisePromise = new Promise<OmiseClient>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${OMISE_SCRIPT_SRC}"]`,
      );

      const handleReady = () => {
        const omise = window.Omise;
        if (!omise) {
          reject(new Error('ไม่สามารถโหลด Omise.js ได้'));
          return;
        }
        omise.setPublicKey(publicKey);
        resolve(omise);
      };

      if (existing) {
        existing.addEventListener('load', handleReady, { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('ไม่สามารถโหลด Omise.js ได้')),
          { once: true },
        );
        return;
      }

      const script = document.createElement('script');
      script.src = OMISE_SCRIPT_SRC;
      script.async = true;
      script.onload = handleReady;
      script.onerror = () => reject(new Error('ไม่สามารถโหลด Omise.js ได้'));
      document.head.appendChild(script);
    }).catch((error) => {
      loadOmisePromise = null;
      throw error;
    });
  }

  return loadOmisePromise;
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

export async function tokenizeCard(input: TokenizeCardInput): Promise<string> {
  const omise = await loadOmise();

  return new Promise<string>((resolve, reject) => {
    omise.createToken(
      'card',
      {
        name: input.name.trim(),
        number: input.number.replace(/\s|-/g, ''),
        expiration_month: input.expirationMonth,
        expiration_year: input.expirationYear,
        security_code: input.securityCode.replace(/\D/g, ''),
      },
      (statusCode, response) => {
        if (statusCode !== 200 || !response.id) {
          reject(
            new Error(
              response.message ??
                'ไม่สามารถสร้าง token บัตรได้ กรุณาตรวจสอบข้อมูลบัตร',
            ),
          );
          return;
        }

        resolve(response.id);
      },
    );
  });
}

export function resetOmiseLoaderForTests(): void {
  loadOmisePromise = null;
}
