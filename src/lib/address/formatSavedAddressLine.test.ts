import { describe, expect, it } from 'vitest';
import { formatSavedAddressLine } from './formatSavedAddressLine';

describe('formatSavedAddressLine', () => {
  it('joins address segments with spaces and omits falsy values', () => {
    const line = formatSavedAddressLine({
      addressLine1: '123 ถนนสุขุมวิท',
      addressLine2: null,
      tumbon: 'คลองตัน',
      amphoe: 'วัฒนา',
      province: 'กรุงเทพมหานคร',
      postalCode: '10110',
    });

    expect(line).toBe('123 ถนนสุขุมวิท คลองตัน วัฒนา กรุงเทพมหานคร 10110');
    expect(line).not.toMatch(/ต\.|อ\.|จ\./);
  });

  it('includes addressLine2 when present', () => {
    const line = formatSavedAddressLine({
      addressLine1: '9/47 หมู่ 3',
      addressLine2: 'อาคาร A',
      tumbon: 'บ้านใหม่',
      amphoe: 'ปากเกร็ด',
      province: 'นนทบุรี',
      postalCode: '11120',
    });

    expect(line).toBe('9/47 หมู่ 3 อาคาร A บ้านใหม่ ปากเกร็ด นนทบุรี 11120');
  });
});
