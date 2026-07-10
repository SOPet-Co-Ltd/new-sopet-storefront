import { describe, expect, it } from 'vitest';
import { formatThaiDate, formatThaiDateTime } from './formatThaiDatetime';

describe('formatThaiDatetime', () => {
  it('formats datetime in Thailand timezone', () => {
    const formatted = formatThaiDateTime('2026-07-10T08:17:00.000Z');

    expect(formatted).toContain('15:17');
    expect(formatted).toContain('2569');
  });

  it('treats timezone-less API timestamps as UTC', () => {
    const formatted = formatThaiDateTime('2026-07-10T08:17:00.000');

    expect(formatted).toContain('15:17');
  });

  it('formats date in Thailand timezone', () => {
    const formatted = formatThaiDate('2026-07-10T08:17:00.000Z');

    expect(formatted).toContain('10');
    expect(formatted).toContain('2569');
  });
});
