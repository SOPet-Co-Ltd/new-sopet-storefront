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

export function detectCardBrand(cardNumber: string): string {
  const digits = cleanCardNumber(cardNumber);
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^6/.test(digits)) return 'discover';
  return 'unknown';
}

function getCardNumberLength(value: string): number {
  return getCardBrand(value) === 'amex' ? 15 : 16;
}

export function getExpectedCardNumberDigitLength(cardNumber: string): number {
  return getCardNumberLength(cardNumber);
}

export function isCompleteCardNumber(cardNumber: string): boolean {
  const digits = cleanCardNumber(cardNumber);
  return digits.length === getCardNumberLength(cardNumber);
}

export function passesLuhnCheck(cardNumber: string): boolean {
  const digits = cleanCardNumber(cardNumber);
  if (!/^\d+$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(digits[index] ?? '', 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function isValidCardNumberLuhn(cardNumber: string): boolean {
  if (!isCompleteCardNumber(cardNumber)) {
    return false;
  }
  return passesLuhnCheck(cardNumber);
}

export function isCompleteExpiry(expiry: string): boolean {
  return /^\d{2}\/\d{2}$/.test(expiry.trim());
}

export function isExpiryDateValid(expiry: string, referenceDate = new Date()): boolean {
  const [monthPart, yearPart] = expiry.split('/');
  const month = Number.parseInt(monthPart?.trim() ?? '', 10);
  const year = Number.parseInt(`20${yearPart?.trim() ?? ''}`, 10);

  if (!Number.isFinite(month) || !Number.isFinite(year) || month < 1 || month > 12) {
    return false;
  }

  const lastMomentOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
  return lastMomentOfMonth >= referenceDate;
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
