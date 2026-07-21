const PENDING_PAYMENT_KEY = 'sopet.checkout.pendingPayment';

export type PendingCheckout = {
  paymentId: string;
  orderId: string;
};

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export function setPendingCheckout(pending: PendingCheckout): void {
  writeJson(PENDING_PAYMENT_KEY, pending);
}

export function getPendingCheckout(): PendingCheckout | null {
  return readJson<PendingCheckout>(PENDING_PAYMENT_KEY);
}

export function clearPendingCheckout(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // ignore storage failures
  }
}
