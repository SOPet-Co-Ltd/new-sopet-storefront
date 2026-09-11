import {
  mapGuestFormToCreateAddressInput,
  type GuestCheckoutFormState,
} from '@/lib/checkout/guestCheckoutValidation';
import {
  isEquivalentSavedAddress,
  loadGuestCheckoutRemember,
  markGuestCheckoutRememberImported,
  shouldImportGuestCheckoutRemember,
  type RememberAddressComparable,
} from '@/lib/checkout/guestCheckoutRemember';
import type { CreateAddressInput } from '@/lib/graphql/generated/graphql';

export type ImportRememberedGuestAddressResult =
  'imported' | 'duplicate' | 'skipped' | 'no_match' | 'error';

export type ImportRememberedGuestAddressParams = {
  accountPhone: string;
  addresses: RememberAddressComparable[];
  createAddress: (input: CreateAddressInput) => Promise<unknown>;
};

/**
 * If localStorage guest checkout matches account phone and address is new,
 * createAddress once. Failures are swallowed by the caller for silent login UX.
 */
export async function importRememberedGuestAddress(
  params: ImportRememberedGuestAddressParams,
): Promise<ImportRememberedGuestAddressResult> {
  if (!shouldImportGuestCheckoutRemember(params.accountPhone)) {
    return 'no_match';
  }

  const remembered = loadGuestCheckoutRemember();
  if (!remembered) {
    return 'skipped';
  }

  const form: GuestCheckoutFormState = remembered.form;
  const alreadyExists = params.addresses.some((address) => isEquivalentSavedAddress(address, form));

  if (alreadyExists) {
    markGuestCheckoutRememberImported(params.accountPhone);
    return 'duplicate';
  }

  const isDefault = params.addresses.length === 0;
  const input = mapGuestFormToCreateAddressInput(form, { isDefault });

  try {
    await params.createAddress(input);
    markGuestCheckoutRememberImported(params.accountPhone);
    return 'imported';
  } catch {
    return 'error';
  }
}
