import { beforeAll, describe, expect, it } from 'vitest';
import {
  getDistricts,
  getProvinces,
  getSubdistrictsWithPostal,
  normalizeSearch,
  preloadThaiAddressDataset,
} from '../helpers';

beforeAll(async () => {
  await preloadThaiAddressDataset();
});

describe('thai-address helpers', () => {
  it('returns provinces sorted alphabetically', () => {
    const provinces = getProvinces();

    expect(provinces.length).toBeGreaterThan(70);
    expect(provinces[0]?.label.localeCompare(provinces[1]?.label ?? '')).toBeLessThanOrEqual(0);
  });

  it('filters districts by province', () => {
    const districts = getDistricts('กรุงเทพมหานคร');

    expect(districts.length).toBeGreaterThan(0);
    expect(districts.every((district) => district.label.length > 0)).toBe(true);
  });

  it('returns sub-districts with postal codes for province and district', () => {
    const subdistricts = getSubdistrictsWithPostal('กรุงเทพมหานคร', 'คลองเตย');

    expect(subdistricts.length).toBeGreaterThan(0);
    expect(subdistricts.find((item) => item.label === 'คลองตัน')?.postalCode).toBe('10110');
  });

  it('normalizes search text', () => {
    expect(normalizeSearch('  กรุงเทพ มหานคร  ')).toBe('กรุงเทพมหานคร');
  });
});
