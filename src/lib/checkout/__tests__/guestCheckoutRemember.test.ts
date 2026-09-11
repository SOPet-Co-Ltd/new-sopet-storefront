import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import {
  GUEST_CHECKOUT_REMEMBER_KEY,
  clearGuestCheckoutRemember,
  isEquivalentSavedAddress,
  loadGuestCheckoutRemember,
  matchesRememberedContactPhone,
  markGuestCheckoutRememberImported,
  saveGuestCheckoutRemember,
  shouldImportGuestCheckoutRemember,
} from '@/lib/checkout/guestCheckoutRemember';

const validForm: GuestCheckoutFormState = {
  contactPhone: '0812345678',
  recipientFullName: 'Somchai',
  recipientPhone: '0899999999',
  address: '123 Sukhumvit',
  district: 'Khlong Toei',
  subDistrict: 'Khlong Toei Nuea',
  province: 'Bangkok',
  postalCode: '10110',
  email: 'guest@example.com',
};

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

describe('guestCheckoutRemember', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and loads a guest checkout form snapshot', () => {
    saveGuestCheckoutRemember(validForm);

    const loaded = loadGuestCheckoutRemember();
    expect(loaded).toEqual({
      v: 1,
      form: validForm,
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      GUEST_CHECKOUT_REMEMBER_KEY,
      expect.any(String),
    );
  });

  it('returns null for corrupt or wrong-version JSON', () => {
    localStorage.setItem(GUEST_CHECKOUT_REMEMBER_KEY, '{not-json');
    expect(loadGuestCheckoutRemember()).toBeNull();

    localStorage.setItem(GUEST_CHECKOUT_REMEMBER_KEY, JSON.stringify({ v: 2, form: validForm }));
    expect(loadGuestCheckoutRemember()).toBeNull();

    localStorage.setItem(GUEST_CHECKOUT_REMEMBER_KEY, JSON.stringify({ v: 1 }));
    expect(loadGuestCheckoutRemember()).toBeNull();
  });

  it('clears remembered checkout data', () => {
    saveGuestCheckoutRemember(validForm);
    clearGuestCheckoutRemember();
    expect(loadGuestCheckoutRemember()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith(GUEST_CHECKOUT_REMEMBER_KEY);
  });

  it('matches remembered contact phone with normalized formats', () => {
    expect(matchesRememberedContactPhone('+66812345678', '0812345678')).toBe(true);
    expect(matchesRememberedContactPhone('081-234-5678', '0812345678')).toBe(true);
    expect(matchesRememberedContactPhone('0899999999', '0812345678')).toBe(false);
  });

  it('detects equivalent saved addresses ignoring label and isDefault', () => {
    const saved = {
      id: 'addr-1',
      label: 'ที่อยู่จัดส่ง',
      fullName: ' Somchai ',
      phone: '+66899999999',
      addressLine1: '123 Sukhumvit',
      addressLine2: null,
      amphoe: 'Khlong Toei',
      tumbon: 'Khlong Toei Nuea',
      province: 'Bangkok',
      postalCode: '10110',
      isDefault: true,
    };

    expect(isEquivalentSavedAddress(saved, validForm)).toBe(true);
    expect(
      isEquivalentSavedAddress({ ...saved, addressLine1: '999 Other Rd' }, validForm),
    ).toBe(false);
  });

  it('shouldImport is true when phone matches and not yet imported for that phone', () => {
    saveGuestCheckoutRemember(validForm);
    expect(shouldImportGuestCheckoutRemember('0812345678')).toBe(true);
    expect(shouldImportGuestCheckoutRemember('0899999999')).toBe(false);
  });

  it('shouldImport is false after markGuestCheckoutRememberImported for matching phone', () => {
    saveGuestCheckoutRemember(validForm);
    markGuestCheckoutRememberImported('0812345678');

    const loaded = loadGuestCheckoutRemember();
    expect(loaded?.importedForPhone).toBe('0812345678');
    expect(shouldImportGuestCheckoutRemember('0812345678')).toBe(false);
    // Form remains for guest prefill
    expect(loaded?.form).toEqual(validForm);
  });
});
