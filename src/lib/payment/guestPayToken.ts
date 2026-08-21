const STORAGE_PREFIX = 'sopet_guest_pay:';

function storageKey(id: string): string {
  return `${STORAGE_PREFIX}${id}`;
}

/** Persist guest pay token under order id and optional payment id (SOPET-H-07). */
export function persistGuestPayToken(params: {
  orderId: string;
  token: string;
  paymentId?: string | null;
}): void {
  try {
    sessionStorage.setItem(storageKey(params.orderId), params.token);
    if (params.paymentId) {
      sessionStorage.setItem(storageKey(params.paymentId), params.token);
    }
  } catch {
    // sessionStorage unavailable — payment page may still receive token via createPayment variables in-session
  }
}

export function readGuestPayToken(id: string | null | undefined): string | null {
  if (!id) return null;
  try {
    return sessionStorage.getItem(storageKey(id));
  } catch {
    return null;
  }
}

export function clearGuestPayToken(id: string): void {
  try {
    sessionStorage.removeItem(storageKey(id));
  } catch {
    // ignore
  }
}

/** Resolve token from explicit arg or sessionStorage (payment id and/or order id). */
export function resolveGuestPayToken(params: {
  guestPayToken?: string | null;
  paymentId?: string | null;
  orderId?: string | null;
}): string | undefined {
  if (params.guestPayToken) return params.guestPayToken;
  return readGuestPayToken(params.paymentId) ?? readGuestPayToken(params.orderId) ?? undefined;
}
