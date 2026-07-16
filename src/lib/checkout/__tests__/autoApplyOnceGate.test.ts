import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  hasAutoApplyAttempted,
  markAutoApplyAttempted,
  resetAutoApplyOnceGateMemory,
} from '@/lib/checkout/autoApplyOnceGate';

const AUTO_APPLY_ATTEMPTED_KEY = 'sopet.checkout.autoApplyAttempted';

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

  it('is unmarked until mark writes sentinel key/value', () => {
    expect(hasAutoApplyAttempted()).toBe(false);

    markAutoApplyAttempted();

    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe('1');
    expect(hasAutoApplyAttempted()).toBe(true);
  });

  it('stores sentinel only (no promotion payload / PII)', () => {
    markAutoApplyAttempted();

    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe('1');
    expect(sessionStorage.length).toBe(1);
  });

  it('returns false after sessionStorage is cleared (happy path does not pin Map)', () => {
    markAutoApplyAttempted();
    expect(hasAutoApplyAttempted()).toBe(true);

    sessionStorage.clear();

    expect(hasAutoApplyAttempted()).toBe(false);
  });

  it('rejects non-sentinel stored values', () => {
    sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, 'true');
    expect(hasAutoApplyAttempted()).toBe(false);

    sessionStorage.setItem(AUTO_APPLY_ATTEMPTED_KEY, 'SAVE10');
    expect(hasAutoApplyAttempted()).toBe(false);
  });

  it('falls back to SPA Map when sessionStorage get/set throw', () => {
    stubThrowingSessionStorage();

    expect(() => markAutoApplyAttempted()).not.toThrow();
    expect(hasAutoApplyAttempted()).toBe(true);
  });

  it('keeps Map mark without storage and clears via resetAutoApplyOnceGateMemory', () => {
    stubThrowingSessionStorage();

    markAutoApplyAttempted();
    expect(hasAutoApplyAttempted()).toBe(true);

    resetAutoApplyOnceGateMemory();
    expect(hasAutoApplyAttempted()).toBe(false);
  });

  it('coexists with other sopet.checkout.* sessionStorage keys', () => {
    sessionStorage.setItem('sopet.checkout.allowEntry', '1');
    sessionStorage.setItem('sopet.checkout.pendingPayment', '{"paymentId":"p1","orderId":"o1"}');

    markAutoApplyAttempted();

    expect(sessionStorage.getItem('sopet.checkout.allowEntry')).toBe('1');
    expect(sessionStorage.getItem('sopet.checkout.pendingPayment')).toContain('p1');
    expect(sessionStorage.getItem(AUTO_APPLY_ATTEMPTED_KEY)).toBe('1');
    expect(hasAutoApplyAttempted()).toBe(true);
  });
});
