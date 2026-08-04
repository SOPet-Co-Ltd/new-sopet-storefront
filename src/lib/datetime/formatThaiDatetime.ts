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
