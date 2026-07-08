export type ThaiAddressRow = {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
  district_code: number;
  amphoe_code: number;
  province_code: number;
};

export type ProvinceOption = {
  value: string;
  label: string;
  searchText: string;
  provinceCode: number;
};

export type DistrictOption = {
  value: string;
  label: string;
  searchText: string;
  amphoeCode: number;
};

export type SubdistrictOption = {
  value: string;
  label: string;
  searchText: string;
  postalCode: string;
  districtCode: number;
};
