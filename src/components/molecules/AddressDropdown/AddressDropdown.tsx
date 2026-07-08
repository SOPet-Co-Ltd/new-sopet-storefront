'use client';

import { SearchableSelect, type SearchableSelectProps } from '@/components/molecules/SearchableSelect';
import type { SearchableOption } from '@/components/molecules/SearchableSelect/types';

export type AddressOption = SearchableOption;

export type AddressDropdownProps = Omit<
  SearchableSelectProps,
  'storeFieldValue' | 'showAllOptions'
> & {
  onSelect?: (option: AddressOption) => void;
};

export function AddressDropdown({
  storeFieldValue = 'label',
  showAllOptions = true,
  searchable = true,
  ...props
}: AddressDropdownProps & {
  storeFieldValue?: 'value' | 'label';
  showAllOptions?: boolean;
}) {
  return (
    <SearchableSelect
      {...props}
      searchable={searchable}
      showAllOptions={showAllOptions}
      storeFieldValue={storeFieldValue}
    />
  );
}
