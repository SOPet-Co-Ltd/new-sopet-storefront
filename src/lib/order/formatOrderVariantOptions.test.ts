import { describe, expect, it } from 'vitest';
import { formatOrderVariantOptions } from './formatOrderVariantOptions';

describe('formatOrderVariantOptions', () => {
  it('formats JSON string with keys sorted and joined by ·', () => {
    expect(formatOrderVariantOptions('{"รสชาติ":"ปลาแซลมอน","ขนาด":"1.5kg"}')).toBe(
      'ขนาด: 1.5kg · รสชาติ: ปลาแซลมอน',
    );
  });

  it('formats an already-parsed object the same way', () => {
    expect(
      formatOrderVariantOptions({
        รสชาติ: 'ปลาแซลมอน',
        ขนาด: '1.5kg',
      }),
    ).toBe('ขนาด: 1.5kg · รสชาติ: ปลาแซลมอน');
  });

  it('omits null, empty, and empty-object snapshots', () => {
    expect(formatOrderVariantOptions(null)).toBeNull();
    expect(formatOrderVariantOptions(undefined)).toBeNull();
    expect(formatOrderVariantOptions('')).toBeNull();
    expect(formatOrderVariantOptions('{}')).toBeNull();
    expect(formatOrderVariantOptions({})).toBeNull();
  });

  it('omits invalid JSON without throwing', () => {
    expect(formatOrderVariantOptions('{not-json')).toBeNull();
  });
});
