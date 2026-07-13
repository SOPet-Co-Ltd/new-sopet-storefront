import { DATE_INPUT_PATTERN, parseDateInputValue } from '@/lib/datetime/calendarUtils';
import { formatThaiDate } from '@/lib/datetime/formatThaiDatetime';

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

  const parts = parseDateInputValue(trimmed);
  if (!parts) {
    return 'วันเกิดไม่ถูกต้อง';
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const dateUtc = Date.UTC(parts.year, parts.month - 1, parts.day);
  if (dateUtc > todayUtc) {
    return 'วันเกิดต้องไม่เป็นวันในอนาคต';
  }

  if (parts.year < 1900) {
    return 'วันเกิดไม่ถูกต้อง';
  }

  return null;
}
