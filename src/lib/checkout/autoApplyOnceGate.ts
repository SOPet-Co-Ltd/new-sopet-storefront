const AUTO_APPLY_ATTEMPTED_KEY = 'sopet.checkout.autoApplyAttempted';
const SENTINEL = '1';

/** Module-level fallback when sessionStorage throws (SPA session only). */
const memoryGate = new Map<string, string>();

/** Clears in-memory once-gate (tests / optional SPA reset). */
export function resetAutoApplyOnceGateMemory(): void {
  memoryGate.clear();
}

export function hasAutoApplyAttempted(): boolean {
  if (typeof window !== 'undefined') {
    try {
      return window.sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY) === SENTINEL;
    } catch {
      // fall through to memory
    }
  }
  return memoryGate.get(AUTO_APPLY_ATTEMPTED_KEY) === SENTINEL;
}

export function markAutoApplyAttempted(): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, SENTINEL);
      return;
    } catch {
      // fall through to memory
    }
  }
  memoryGate.set(AUTO_APPLY_ATTEMPTED_KEY, SENTINEL);
}
