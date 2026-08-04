import { describe, expect, it } from 'vitest';
import {
  getCalendarDays,
  getYearRange,
  isDateInRange,
  parseDateInputValue,
  toDateInputValue,
} from './calendarUtils';

describe('calendarUtils', () => {
  it('parses and serializes YYYY-MM-DD values', () => {
    expect(parseDateInputValue('1990-05-15')).toEqual({ year: 1990, month: 5, day: 15 });
    expect(toDateInputValue(1990, 5, 15)).toBe('1990-05-15');
  });

  it('builds a month grid with leading blanks', () => {
    const cells = getCalendarDays(2024, 3);
    expect(cells.filter((cell) => cell.isCurrentMonth)).toHaveLength(31);
    expect(cells[0].day).toBeNull();
  });

  it('checks min and max date boundaries', () => {
    expect(isDateInRange('1990-05-15', '1900-01-01', '2000-12-31')).toBe(true);
    expect(isDateInRange('1999-05-15', '1900-01-01', '1990-01-01')).toBe(false);
  });

  it('returns descending year options', () => {
    expect(getYearRange('1990-01-01', '1992-12-31')).toEqual([1992, 1991, 1990]);
  });
});
