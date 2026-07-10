export function cleanCardNumber(value: string): string {
  return value.replace(/\D/g, '');
}

function getCardBrand(value: string): 'amex' | 'unknown' {
  const digits = cleanCardNumber(value);
  if (/^3[47]/.test(digits)) {
    return 'amex';
  }
  return 'unknown';
}

function getCardNumberLength(value: string): number {
  return getCardBrand(value) === 'amex' ? 15 : 16;
}

export function getCvvLength(cardNumber: string): number {
  return getCardBrand(cardNumber) === 'amex' ? 4 : 3;
}

export function getCvvPlaceholder(cardNumber: string): string {
  return getCvvLength(cardNumber) === 4 ? '****' : '***';
}

export function isValidCvv(cvv: string, cardNumber: string): boolean {
  const digits = cvv.replace(/\D/g, '');
  return digits.length === getCvvLength(cardNumber);
}

export function formatCardNumber(value: string): string {
  const digits = cleanCardNumber(value).slice(0, getCardNumberLength(value));

  if (getCardBrand(digits) === 'amex') {
    return digits
      .replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, first, second, third) =>
        [first, second, third].filter(Boolean).join('-'),
      )
      .replace(/-$/, '');
  }

  return digits.replace(/(.{4})/g, '$1-').replace(/-$/, '');
}

export function formatExpiry(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 4)
    .replace(/(\d{2})(\d{0,2})/, (_, month, year) => (year ? `${month}/${year}` : month));
}

export function formatCvv(value: string, cardNumber = ''): string {
  return value.replace(/\D/g, '').slice(0, getCvvLength(cardNumber));
}

export function formatCardName(value: string): string {
  return value.replace(/[^a-zA-Z\u0E00-\u0E7F\s]/g, '').replace(/\s{2,}/g, ' ');
}
