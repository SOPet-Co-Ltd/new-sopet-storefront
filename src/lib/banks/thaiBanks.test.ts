import { describe, expect, it } from 'vitest';
import { resolveThaiBankBrand } from './thaiBanks';

describe('resolveThaiBankBrand', () => {
  it('matches canonical admin bank names', () => {
    expect(resolveThaiBankBrand('ธนาคารกสิกรไทย')?.code).toBe('kbank');
    expect(resolveThaiBankBrand('ธนาคารไทยพาณิชย์')?.logoSrc).toBe('/images/banks/scb.svg');
  });

  it('matches legacy short names', () => {
    expect(resolveThaiBankBrand('กสิกรไทย')?.code).toBe('kbank');
    expect(resolveThaiBankBrand('กรุงเทพ')?.code).toBe('bbl');
  });

  it('returns null for unknown banks', () => {
    expect(resolveThaiBankBrand('ธนาคารที่ไม่มี')).toBeNull();
    expect(resolveThaiBankBrand('')).toBeNull();
  });
});
