import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';

const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function toDateInputValue(value?: string | null): string {
  if (!value?.trim()) return '';
  const trimmed = value.trim();
  if (DATE_INPUT_PATTERN.test(trimmed)) return trimmed;
  return trimmed.slice(0, 10);
}

export function formatCustomerDateOfBirth(value?: string | null): string | null {
  if (!value?.trim()) return null;
  return formatThaiDate(value.trim());
}

export function validateCustomerDateOfBirth(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'กรุณาเลือกวันเกิด';
  }

  if (!DATE_INPUT_PATTERN.test(trimmed)) {
    return 'รูปแบบวันเกิดไม่ถูกต้อง';
  }

  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return 'วันเกิดไม่ถูกต้อง';
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (date.getTime() > todayUtc) {
    return 'วันเกิดต้องไม่เป็นวันในอนาคต';
  }

  if (year < 1900) {
    return 'วันเกิดไม่ถูกต้อง';
  }

  return null;
}
