import type { SavedAddress } from '@/lib/hooks/useAddresses';

export function formatSavedAddressLine(
  address: Pick<
    SavedAddress,
    'addressLine1' | 'addressLine2' | 'tumbon' | 'amphoe' | 'province' | 'postalCode'
  >,
): string {
  return [
    address.addressLine1,
    address.addressLine2,
    address.tumbon,
    address.amphoe,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(' ');
}
