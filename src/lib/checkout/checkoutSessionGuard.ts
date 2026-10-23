import { hasClientSession } from '@/lib/graphql/authLink';

export const CHECKOUT_LOGIN_RETURN_PATH = '/checkout';

export function checkoutLoginRedirectUrl(returnPath: string = CHECKOUT_LOGIN_RETURN_PATH): string {
  return `/login?returnUrl=${encodeURIComponent(returnPath)}`;
}

/**
 * After site data / auth cookies are cleared, checkout can still show saved-address UI
 * from Apollo cache while submit would fall through to guest validation (SF-CHK-115).
 */
export function shouldRedirectCheckoutToLogin(params: {
  isAuthenticated: boolean;
  hasCachedCustomer: boolean;
  addressCount: number;
  selectedAddressId: string | null;
  hasLiveSession?: boolean;
}): boolean {
  const sessionLive = params.hasLiveSession ?? hasClientSession();
  if (sessionLive) {
    return false;
  }

  const looksLikeMemberCheckout =
    params.isAuthenticated ||
    params.hasCachedCustomer ||
    params.addressCount > 0 ||
    Boolean(params.selectedAddressId);

  return looksLikeMemberCheckout;
}
