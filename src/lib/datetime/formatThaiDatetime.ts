export const THAILAND_TIME_ZONE = 'Asia/Bangkok';

function parseApiDate(value: string | Date): Date {
  if (value instanceof Date) {
    return value;
  }

  const trimmed = value.trim();
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  // Date-only values (e.g. customer dateOfBirth) need a full ISO datetime.
  // Appending bare "Z" yields "YYYY-MM-DDZ", which Safari rejects as Invalid Date.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`);
  }

  // API timestamps without an offset are UTC wall-clock values.
  return new Date(`${trimmed}Z`);
}

export function formatThaiDateTime(value: string | Date): string {
  const date = parseApiDate(value);

  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: THAILAND_TIME_ZONE,
  }).format(date);
}

export function formatThaiDate(value: string | Date): string {
  const date = parseApiDate(value);

  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: THAILAND_TIME_ZONE,
  }).format(date);
}

/** Recent reviews read as "2 วันที่แล้ว"; older ones keep the calendar date. */
export function formatRelativeThaiDate(value: string | Date, now: Date = new Date()): string {
  const date = parseApiDate(value);
  const elapsedMs = now.getTime() - date.getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return formatThaiDate(value);
  }

  const minuteMs = 60 * 1000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (elapsedMs < minuteMs) return 'เมื่อสักครู่';
  if (elapsedMs < hourMs) return `${Math.floor(elapsedMs / minuteMs)} นาทีที่แล้ว`;
  if (elapsedMs < dayMs) return `${Math.floor(elapsedMs / hourMs)} ชั่วโมงที่แล้ว`;
  if (elapsedMs < 30 * dayMs) return `${Math.floor(elapsedMs / dayMs)} วันที่แล้ว`;
  return formatThaiDate(value);
}
