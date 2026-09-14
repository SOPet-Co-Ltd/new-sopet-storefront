import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuestCheckoutFormState } from '@/lib/checkout/guestCheckoutValidation';
import {
  GUEST_CHECKOUT_REMEMBER_KEY,
  loadGuestCheckoutRemember,
  saveGuestCheckoutRemember,
} from '@/lib/checkout/guestCheckoutRemember';
import { importRememberedGuestAddress } from '@/lib/checkout/importRememberedGuestAddress';

const form: GuestCheckoutFormState = {
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

describe('importRememberedGuestAddress', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates address when phone matches and no duplicate exists', async () => {
    saveGuestCheckoutRemember(form);
    const createAddress = vi.fn().mockResolvedValue({ id: 'addr-new' });

    const result = await importRememberedGuestAddress({
      accountPhone: '0812345678',
      addresses: [],
      createAddress,
    });

    expect(result).toBe('imported');
    expect(createAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientName: 'Somchai',
        recipientPhone: '0899999999',
        addressLine1: '123 Sukhumvit',
        isDefault: true,
      }),
    );
    expect(loadGuestCheckoutRemember()?.importedForPhone).toBe('0812345678');
    expect(loadGuestCheckoutRemember()?.form).toEqual(form);
  });

  it('skips createAddress when an equivalent address already exists', async () => {
    saveGuestCheckoutRemember(form);
    const createAddress = vi.fn();

    const result = await importRememberedGuestAddress({
      accountPhone: '0812345678',
      addresses: [
        {
          fullName: 'Somchai',
          phone: '0899999999',
          addressLine1: '123 Sukhumvit',
          addressLine2: null,
          amphoe: 'Khlong Toei',
          tumbon: 'Khlong Toei Nuea',
          province: 'Bangkok',
          postalCode: '10110',
        },
      ],
      createAddress,
    });

    expect(result).toBe('duplicate');
    expect(createAddress).not.toHaveBeenCalled();
    expect(loadGuestCheckoutRemember()?.importedForPhone).toBe('0812345678');
  });

  it('does nothing when account phone differs from remembered contact phone', async () => {
    saveGuestCheckoutRemember(form);
    const createAddress = vi.fn();

    const result = await importRememberedGuestAddress({
      accountPhone: '0899999999',
      addresses: [],
      createAddress,
    });

    expect(result).toBe('no_match');
    expect(createAddress).not.toHaveBeenCalled();
    expect(localStorage.getItem(GUEST_CHECKOUT_REMEMBER_KEY)).toBeTruthy();
  });

  it('returns error without throwing when createAddress fails', async () => {
    saveGuestCheckoutRemember(form);
    const createAddress = vi.fn().mockRejectedValue(new Error('network'));

    const result = await importRememberedGuestAddress({
      accountPhone: '0812345678',
      addresses: [],
      createAddress,
    });

    expect(result).toBe('error');
    expect(loadGuestCheckoutRemember()?.importedForPhone).toBeUndefined();
  });

  it('sets isDefault false when account already has addresses', async () => {
    saveGuestCheckoutRemember(form);
    const createAddress = vi.fn().mockResolvedValue({ id: 'addr-new' });

    await importRememberedGuestAddress({
      accountPhone: '0812345678',
      addresses: [
        {
          fullName: 'Other',
          phone: '0811111111',
          addressLine1: 'Other Rd',
          amphoe: 'A',
          province: 'B',
          postalCode: '10110',
        },
      ],
      createAddress,
    });

    expect(createAddress).toHaveBeenCalledWith(expect.objectContaining({ isDefault: false }));
  });
});
