const AUTO_APPLY_ATTEMPTED_KEY = 'sopet.checkout.autoApplyAttempted';

/** Module-level fallback when sessionStorage throws (SPA session only). */
const memoryGate = new Map<string, string>();

export type AutoApplyCartFingerprintLine = {
  variantId: string;
  quantity: number;
};

/**
 * Stable cart identity for once-gate scoping.
 * Same selected lines → same fingerprint (remount/refresh skip).
 * Qty / variant / selection change → new fingerprint (re-auto-apply).
 */
export function buildAutoApplyCartFingerprint(
  lines: ReadonlyArray<AutoApplyCartFingerprintLine>,
): string {
  if (lines.length === 0) {
    return '';
  }

  return lines
    .map((line) => `${line.variantId}:${line.quantity}`)
    .sort((a, b) => a.localeCompare(b))
    .join('|');
}

function readStoredFingerprint(): string | null {
  if (typeof window !== 'undefined') {
    try {
      return window.sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY);
    } catch {
      // fall through to memory
    }
  }
  return memoryGate.get(AUTO_APPLY_ATTEMPTED_KEY) ?? null;
}

function writeStoredFingerprint(fingerprint: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, fingerprint);
      return;
    } catch {
      // fall through to memory
    }
  }
  memoryGate.set(AUTO_APPLY_ATTEMPTED_KEY, fingerprint);
}

/** Clears in-memory once-gate (tests / optional SPA reset). */
export function resetAutoApplyOnceGateMemory(): void {
  memoryGate.clear();
}

/** Stored fingerprint for the last settled auto-apply attempt, or null. */
export function getAutoApplyAttemptedFingerprint(): string | null {
  return readStoredFingerprint();
}

/**
 * True when auto-apply already settled for this exact cart fingerprint.
 * Legacy sentinel `'1'` never matches a real fingerprint → allows one re-attempt.
 */
export function hasAutoApplyAttempted(cartFingerprint: string): boolean {
  if (!cartFingerprint) {
    return false;
  }
  return readStoredFingerprint() === cartFingerprint;
}

export function markAutoApplyAttempted(cartFingerprint: string): void {
  if (!cartFingerprint) {
    return;
  }
  writeStoredFingerprint(cartFingerprint);
}

/** Clears once-gate (login, tests, or explicit reset). */
export function clearAutoApplyAttempted(): void {
  memoryGate.delete(AUTO_APPLY_ATTEMPTED_KEY);
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(AUTO_APPLY_ATTEMPTED_KEY);
    } catch {
      // memory already cleared
    }
  }
}
