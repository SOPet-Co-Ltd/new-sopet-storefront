export type SearchableOption = {
  value: string;
  label: string;
  searchText?: string;
  postalCode?: string;
};

export function getOptionSearchText(option: SearchableOption): string {
  return option.searchText ?? option.label.trim().toLowerCase().replace(/\s+/g, '');
}
