import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildAutoApplyCartFingerprint,
  clearAutoApplyAttempted,
  getAutoApplyAttemptedFingerprint,
  hasAutoApplyAttempted,
  markAutoApplyAttempted,
  resetAutoApplyOnceGateMemory,
} from '@/lib/checkout/autoApplyOnceGate';

const AUTO_APPLY_ATTEMPTED_KEY = 'sopet.checkout.autoApplyAttempted';
const FP_A = 'var-a:1|var-b:2';
const FP_B = 'var-a:2|var-b:2';

function stubThrowingSessionStorage(): void {
  const throwingStorage = {
    getItem: () => {
      throw new Error('sessionStorage unavailable');
    },
    setItem: () => {
      throw new Error('sessionStorage unavailable');
    },
    removeItem: () => {
      throw new Error('sessionStorage unavailable');
    },
    clear: () => {
      throw new Error('sessionStorage unavailable');
    },
    key: () => {
      throw new Error('sessionStorage unavailable');
    },
    get length() {
      throw new Error('sessionStorage unavailable');
    },
  } as unknown as Storage;

  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    writable: true,
    value: throwingStorage,
  });
}

describe('autoApplyOnceGate', () => {
  const originalSessionStorage = window.sessionStorage;

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      writable: true,
      value: originalSessionStorage,
    });
    originalSessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      writable: true,
      value: originalSessionStorage,
    });
    originalSessionStorage.clear();
    resetAutoApplyOnceGateMemory();
  });

  it('buildAutoApplyCartFingerprint is stable and order-independent', () => {
    expect(
      buildAutoApplyCartFingerprint([
        { variantId: 'var-b', quantity: 2 },
        { variantId: 'var-a', quantity: 1 },
      ]),
    ).toBe(FP_A);
    expect(
      buildAutoApplyCartFingerprint([
        { variantId: 'var-a', quantity: 1 },
        { variantId: 'var-b', quantity: 2 },
      ]),
    ).toBe(FP_A);
  });

  it('buildAutoApplyCartFingerprint changes when quantity changes', () => {
    expect(
      buildAutoApplyCartFingerprint([
        { variantId: 'var-a', quantity: 2 },
        { variantId: 'var-b', quantity: 2 },
      ]),
    ).toBe(FP_B);
    expect(FP_A).not.toBe(FP_B);
  });

  it('is unmarked until mark writes fingerprint; has* matches only that fingerprint', () => {
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);

    markAutoApplyAttempted(FP_A);

    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe(FP_A);
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);
    expect(hasAutoApplyAttempted(FP_B)).toBe(false);
    expect(getAutoApplyAttemptedFingerprint()).toBe(FP_A);
  });

  it('stores fingerprint only (no promotion payload / PII)', () => {
    markAutoApplyAttempted(FP_A);

    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe(FP_A);
    expect(sessionStorage.length).toBe(1);
  });

  it('returns false after sessionStorage is cleared', () => {
    markAutoApplyAttempted(FP_A);
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);

    sessionStorage.clear();

    expect(hasAutoApplyAttempted(FP_A)).toBe(false);
  });

  it('rejects legacy sentinel and unrelated stored values for a real fingerprint', () => {
    sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, '1');
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);

    sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, 'true');
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);

    sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, 'SAVE10');
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);
  });

  it('falls back to SPA Map when sessionStorage get/set throw', () => {
    stubThrowingSessionStorage();

    expect(() => markAutoApplyAttempted(FP_A)).not.toThrow();
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);
    expect(hasAutoApplyAttempted(FP_B)).toBe(false);
  });

  it('keeps Map mark without storage and clears via resetAutoApplyOnceGateMemory', () => {
    stubThrowingSessionStorage();

    markAutoApplyAttempted(FP_A);
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);

    resetAutoApplyOnceGateMemory();
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);
  });

  it('coexists with other sopet.checkout.* sessionStorage keys', () => {
    sessionStorage.setItem('sopet.checkout.allowEntry', '1');
    sessionStorage.setItem('sopet.checkout.pendingPayment', '{"paymentId":"p1","orderId":"o1"}');

    markAutoApplyAttempted(FP_A);

    expect(sessionStorage.getItem('sopet.checkout.allowEntry')).toBe('1');
    expect(sessionStorage.getItem('sopet.checkout.pendingPayment')).toContain('p1');
    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe(FP_A);
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);
  });

  it('clearAutoApplyAttempted removes fingerprint from sessionStorage and memory', () => {
    markAutoApplyAttempted(FP_A);
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);

    clearAutoApplyAttempted();

    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBeNull();
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);
    expect(getAutoApplyAttemptedFingerprint()).toBeNull();
  });

  it('clearAutoApplyAttempted clears Map fallback when sessionStorage throws', () => {
    stubThrowingSessionStorage();
    markAutoApplyAttempted(FP_A);
    expect(hasAutoApplyAttempted(FP_A)).toBe(true);

    expect(() => clearAutoApplyAttempted()).not.toThrow();
    expect(hasAutoApplyAttempted(FP_A)).toBe(false);
  });

  it('empty fingerprint never marks or matches', () => {
    markAutoApplyAttempted('');
    expect(getAutoApplyAttemptedFingerprint()).toBeNull();
    expect(hasAutoApplyAttempted('')).toBe(false);
  });
});
