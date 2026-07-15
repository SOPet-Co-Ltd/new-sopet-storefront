'use client';

import { useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'sopet:3ds-auto-redirect:';

/** Module-level fallback when sessionStorage throws (SPA session only). */
const memoryGate = new Map<string, string>();

export function threeDSAutoRedirectStorageKey(paymentId: string): string {
  return `${STORAGE_KEY_PREFIX}${paymentId}`;
}

/** Clears in-memory gate (tests / optional SPA reset). */
export function resetPayment3dsAutoRedirectMemory(): void {
  memoryGate.clear();
}

function readStoredAuthorizeUri(key: string): string | null {
  try {
    const fromStorage = sessionStorage.getItem(key);
    if (fromStorage !== null) {
      return fromStorage;
    }
  } catch {
    // fall through to memory
  }
  return memoryGate.get(key) ?? null;
}

function writeStoredAuthorizeUri(key: string, authorizeUri: string): void {
  memoryGate.set(key, authorizeUri);
  try {
    sessionStorage.setItem(key, authorizeUri);
  } catch {
    // memory already holds the one-shot mark for this SPA session
  }
}

function defaultNavigate(authorizeUri: string): void {
  window.location.href = authorizeUri;
}

export type Payment3dsAutoRedirectProps = {
  paymentId: string;
  status: string | null | undefined;
  authorizeUri: string | null | undefined;
  /** Test seam / optional override; production uses window.location.href */
  navigate?: (uri: string) => void;
};

/**
 * One-shot 3DS auto-redirect gate (AC-003 / AC-012).
 * Writes `sopet:3ds-auto-redirect:{paymentId}` = authorizeUri before navigate;
 * skips when stored value equals the current authorizeUri.
 */
export function Payment3dsAutoRedirect({
  paymentId,
  status,
  authorizeUri,
  navigate = defaultNavigate,
}: Payment3dsAutoRedirectProps): null {
  useEffect(() => {
    if (status !== 'pending') {
      return;
    }
    if (!authorizeUri) {
      return;
    }

    const key = threeDSAutoRedirectStorageKey(paymentId);
    const stored = readStoredAuthorizeUri(key);
    if (stored === authorizeUri) {
      return;
    }

    writeStoredAuthorizeUri(key, authorizeUri);
    navigate(authorizeUri);
  }, [paymentId, status, authorizeUri, navigate]);

  return null;
}
