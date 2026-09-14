import {
  mapGuestFormToCreateAddressInput,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import { normalizeThaiPhoneNumber } from '@/lib/helpers/phone';

export const GUEST_CHECKOUT_REMEMBER_KEY = 'sopet.checkout.guestRemember';

export type GuestCheckoutRememberV1 = {
  v: 1;
  form: GuestCheckoutFormState;
  importedForPhone?: string;
};

/** Minimal shape used for duplicate detection (matches SavedAddress fields we care about). */
export type RememberAddressComparable = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  amphoe: string;
  tumbon?: string | null;
  province: string;
  postalCode: string;
};

function readStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage?.getItem(GUEST_CHECKOUT_REMEMBER_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage?.setItem(GUEST_CHECKOUT_REMEMBER_KEY, value);
  } catch {
    // ignore quota / private mode
  }
}

function removeStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage?.removeItem(GUEST_CHECKOUT_REMEMBER_KEY);
  } catch {
    // ignore
  }
}

function isGuestCheckoutFormState(value: unknown): value is GuestCheckoutFormState {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const form = value as Record<string, unknown>;
  return (
    typeof form.contactPhone === 'string' &&
    typeof form.recipientFullName === 'string' &&
    typeof form.recipientPhone === 'string' &&
    typeof form.address === 'string' &&
    typeof form.district === 'string' &&
    typeof form.province === 'string' &&
    typeof form.postalCode === 'string'
  );
}

function parseStored(raw: string | null): GuestCheckoutRememberV1 | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<GuestCheckoutRememberV1>;
    if (parsed?.v !== 1 || !isGuestCheckoutFormState(parsed.form)) {
      return null;
    }
    return {
      v: 1,
      form: parsed.form,
      ...(typeof parsed.importedForPhone === 'string'
        ? { importedForPhone: parsed.importedForPhone }
        : {}),
    };
  } catch {
    return null;
  }
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

export function loadGuestCheckoutRemember(): GuestCheckoutRememberV1 | null {
  return parseStored(readStorage());
}

export function saveGuestCheckoutRemember(form: GuestCheckoutFormState): void {
  // Fresh guest order snapshot — omit importedForPhone so a later matching login can import.
  const payload: GuestCheckoutRememberV1 = {
    v: 1,
    form: { ...form },
  };
  writeStorage(JSON.stringify(payload));
}

export function clearGuestCheckoutRemember(): void {
  removeStorage();
}

export function markGuestCheckoutRememberImported(phone: string): void {
  const existing = loadGuestCheckoutRemember();
  if (!existing) {
    return;
  }
  const payload: GuestCheckoutRememberV1 = {
    ...existing,
    importedForPhone: normalizeThaiPhoneNumber(phone),
  };
  writeStorage(JSON.stringify(payload));
}

export function matchesRememberedContactPhone(
  accountPhone: string,
  contactPhone: string,
): boolean {
  const a = normalizeThaiPhoneNumber(accountPhone);
  const b = normalizeThaiPhoneNumber(contactPhone);
  if (!a || !b) {
    return false;
  }
  return a === b;
}

export function isEquivalentSavedAddress(
  saved: RememberAddressComparable,
  form: GuestCheckoutFormState,
): boolean {
  const input = mapGuestFormToCreateAddressInput(form, { isDefault: false });

  return (
    normalizeText(saved.fullName) === normalizeText(input.recipientName) &&
    normalizeThaiPhoneNumber(saved.phone) === normalizeThaiPhoneNumber(input.recipientPhone) &&
    normalizeText(saved.addressLine1) === normalizeText(input.addressLine1) &&
    normalizeText(saved.addressLine2) === normalizeText(input.addressLine2) &&
    normalizeText(saved.amphoe) === normalizeText(input.amphoe) &&
    normalizeText(saved.tumbon) === normalizeText(input.tumbon) &&
    normalizeText(saved.province) === normalizeText(input.province) &&
    normalizeText(saved.postalCode) === normalizeText(input.postalCode)
  );
}

export function shouldImportGuestCheckoutRemember(accountPhone: string): boolean {
  const remembered = loadGuestCheckoutRemember();
  if (!remembered) {
    return false;
  }
  if (!matchesRememberedContactPhone(accountPhone, remembered.form.contactPhone)) {
    return false;
  }
  const normalizedAccount = normalizeThaiPhoneNumber(accountPhone);
  if (remembered.importedForPhone && remembered.importedForPhone === normalizedAccount) {
    return false;
  }
  return true;
}
