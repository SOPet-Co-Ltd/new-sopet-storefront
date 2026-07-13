export const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ParsedDateParts = {
  year: number;
  month: number;
  day: number;
};

export type CalendarDayCell = {
  date: string | null;
  day: number | null;
  isCurrentMonth: boolean;
};

export function parseDateInputValue(value: string): ParsedDateParts | null {
  const trimmed = value.trim();
  if (!DATE_INPUT_PATTERN.test(trimmed)) return null;

  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function toDateInputValue(year: number, month: number, day: number): string {
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
}

export function compareDateInputValues(left: string, right: string): number {
  return left.localeCompare(right);
}

export function isDateInRange(date: string, min?: string, max?: string): boolean {
  if (min && compareDateInputValues(date, min) < 0) return false;
  if (max && compareDateInputValues(date, max) > 0) return false;
  return true;
}

export function getYearRange(min?: string, max?: string): number[] {
  const minYear = min ? (parseDateInputValue(min)?.year ?? 1900) : 1900;
  const maxYear = max
    ? (parseDateInputValue(max)?.year ?? new Date().getUTCFullYear())
    : new Date().getUTCFullYear();

  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return years;
}

export function getCalendarDays(year: number, month: number): CalendarDayCell[] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = firstDay.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < startWeekday; index += 1) {
    cells.push({ date: null, day: null, isCurrentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      date: toDateInputValue(year, month, day),
      day,
      isCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null, isCurrentMonth: false });
  }

  return cells;
}

export function getThaiMonthLabels(year: number): string[] {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(year, index, 1));
    return new Intl.DateTimeFormat('th-TH', { month: 'long', timeZone: 'UTC' }).format(date);
  });
}

export const THAI_WEEKDAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as const;
