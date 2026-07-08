import type {
  DistrictOption,
  ProvinceOption,
  SubdistrictOption,
  ThaiAddressRow,
} from './types';

let cachedDataset: ThaiAddressRow[] | null = null;
let datasetPromise: Promise<ThaiAddressRow[]> | null = null;

async function loadDataset(): Promise<ThaiAddressRow[]> {
  if (cachedDataset) {
    return cachedDataset;
  }

  if (!datasetPromise) {
    datasetPromise = import('./dataset').then((module): ThaiAddressRow[] => {
      const data = module.THAI_ADDRESS as unknown as ThaiAddressRow[];
      cachedDataset = data;
      return data;
    });
  }

  return datasetPromise;
}

export async function preloadThaiAddressDataset(): Promise<void> {
  await loadDataset();
}

export function isThaiAddressDatasetReady(): boolean {
  return cachedDataset !== null;
}

const normalizeText = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, '');

function getDataset(): ThaiAddressRow[] {
  if (!cachedDataset) {
    throw new Error(
      'Thai address dataset not loaded. Call preloadThaiAddressDataset() first.',
    );
  }

  return cachedDataset;
}

export function getProvinces(): ProvinceOption[] {
  const rows = getDataset();
  const seen = new Set<string>();
  const result: ProvinceOption[] = [];

  for (const row of rows) {
    if (seen.has(row.province)) continue;

    seen.add(row.province);

    result.push({
      value: row.province,
      label: row.province,
      searchText: normalizeText(row.province),
      provinceCode: Number(row.province_code),
    });
  }

  result.sort((a, b) => a.label.localeCompare(b.label));

  return result;
}

export function getDistricts(provinceValue: string): DistrictOption[] {
  if (!provinceValue) return [];

  const rows = getDataset().filter((row) => row.province === provinceValue);
  const seen = new Set<string>();
  const result: DistrictOption[] = [];

  for (const row of rows) {
    if (seen.has(row.amphoe)) continue;

    seen.add(row.amphoe);

    result.push({
      value: row.amphoe,
      label: row.amphoe,
      searchText: normalizeText(row.amphoe),
      amphoeCode: Number(row.amphoe_code),
    });
  }

  result.sort((a, b) => a.label.localeCompare(b.label));

  return result;
}

export function getSubdistrictsWithPostal(
  provinceValue: string,
  districtValue: string,
): SubdistrictOption[] {
  if (!provinceValue || !districtValue) return [];

  const rows = getDataset().filter(
    (row) => row.province === provinceValue && row.amphoe === districtValue,
  );

  return rows.map((item) => ({
    value: item.district,
    label: item.district,
    searchText: normalizeText(item.district),
    postalCode: String(item.zipcode),
    districtCode: Number(item.district_code),
  }));
}

export const normalizeSearch = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, '');

export const trimValue = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;
