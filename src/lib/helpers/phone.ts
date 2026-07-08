export const THAI_PHONE_SUBSCRIBER_LENGTH = 9;

export function getThaiPhoneSubscriber(value: string | null | undefined): string {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (digits.startsWith('660')) {
    return digits.slice(3, 3 + THAI_PHONE_SUBSCRIBER_LENGTH);
  }

  if (digits.startsWith('66')) {
    return digits.slice(2, 2 + THAI_PHONE_SUBSCRIBER_LENGTH);
  }

  if (digits.startsWith('0')) {
    return digits.slice(1, 1 + THAI_PHONE_SUBSCRIBER_LENGTH);
  }

  return digits.slice(0, THAI_PHONE_SUBSCRIBER_LENGTH);
}

export function formatThaiPhoneSubscriber(value: string | null | undefined): string {
  const subscriber = getThaiPhoneSubscriber(value);

  if (subscriber.length <= 2) {
    return subscriber;
  }

  if (subscriber.length <= 5) {
    return `${subscriber.slice(0, 2)}-${subscriber.slice(2)}`;
  }

  return `${subscriber.slice(0, 2)}-${subscriber.slice(2, 5)}-${subscriber.slice(5)}`;
}

/** Normalize to local 0-leading Thai phone format (e.g. 0812345678). */
export function normalizeThaiPhoneNumber(phone: string): string {
  const trimmed = phone.trim();

  if (trimmed.startsWith('+66')) {
    return `0${trimmed.slice(3).replace(/\D/g, '').slice(0, 9)}`;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.startsWith('66') && digits.length >= 11) {
    return `0${digits.slice(2, 11)}`;
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 10);
  }

  return digits.slice(0, 10);
}

export function isValidThaiPhoneNumber(phone: string): boolean {
  return /^0[689]\d{8}$/.test(normalizeThaiPhoneNumber(phone));
}

export function formatThaiPhoneNumber(phone: string): string {
  const normalized = normalizeThaiPhoneNumber(phone);

  if (normalized.length !== 10) {
    return phone;
  }

  return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

const THAI_PHONE_DIGIT_LENGTH = 10;

export function sanitizeThaiPhoneInput(raw: string): string {
  return normalizeThaiPhoneNumber(raw).slice(0, THAI_PHONE_DIGIT_LENGTH);
}

export function formatThaiPhoneInputMask(value: string | null | undefined): string {
  const digits = sanitizeThaiPhoneInput(String(value ?? ''));

  if (digits.length <= 3) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/** Display phone numbers in local format (081-234-5678). */
export function formatThaiPhoneNumberForDisplay(value: string | null | undefined): string {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) {
    return '';
  }

  return formatThaiPhoneNumber(trimmed);
}
