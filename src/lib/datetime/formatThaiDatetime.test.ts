import { describe, expect, it } from 'vitest';
import { formatRelativeThaiDate, formatThaiDate, formatThaiDateTime } from './formatThaiDatetime';

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

  it('formats a recent review as days ago', () => {
    const now = new Date('2026-11-15T12:00:00.000Z');

    expect(formatRelativeThaiDate('2026-11-13T12:00:00.000Z', now)).toBe('2 วันที่แล้ว');
    expect(formatRelativeThaiDate('2026-11-15T10:00:00.000Z', now)).toBe('2 ชั่วโมงที่แล้ว');
  });

  it('falls back to the calendar date after 30 days', () => {
    const formatted = formatRelativeThaiDate(
      '2026-10-01T00:00:00.000Z',
      new Date('2026-11-15T00:00:00.000Z'),
    );

    expect(formatted).toContain('2569');
    expect(formatted).not.toContain('วันที่แล้ว');
  });

  it('formats date-only API values without producing Invalid Date', () => {
    const formatted = formatThaiDate('1990-05-15');

    expect(formatted).toContain('15');
    expect(formatted).toContain('2533');
  });
});
