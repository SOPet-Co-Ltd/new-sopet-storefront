export const THAI_PHONE_COUNTRY_CODE = '+66';
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

export function normalizeThaiPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('66') && digits.length === 11) {
    return `0${digits.slice(2)}`;
  }

  return digits;
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

export function formatThaiPhoneNumberForDisplay(value: string | null | undefined): string {
  const trimmed = String(value ?? '').trim();

  if (!trimmed) {
    return '';
  }

  const normalized = normalizeThaiPhoneNumber(trimmed);

  if (normalized.length === 10) {
    return `${THAI_PHONE_COUNTRY_CODE} ${formatThaiPhoneSubscriber(normalized)}`;
  }

  return formatThaiPhoneNumber(trimmed);
}
