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
