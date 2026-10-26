import { describe, expect, it } from 'vitest';
import {
  checkoutLoginRedirectUrl,
  shouldRedirectCheckoutToLogin,
} from '@/lib/checkout/checkoutSessionGuard';

describe('checkoutSessionGuard', () => {
  it('redirects when session is gone but saved-address checkout UI remains (SF-CHK-115)', () => {
    expect(
      shouldRedirectCheckoutToLogin({
        isAuthenticated: false,
        hasCachedCustomer: false,
        addressCount: 2,
        selectedAddressId: null,
        hasLiveSession: false,
      }),
    ).toBe(true);
  });

  it('does not redirect true guest checkout without member signals', () => {
    expect(
      shouldRedirectCheckoutToLogin({
        isAuthenticated: false,
        hasCachedCustomer: false,
        addressCount: 0,
        selectedAddressId: null,
        hasLiveSession: false,
      }),
    ).toBe(false);
  });

  it('builds login URL with checkout return path', () => {
    expect(checkoutLoginRedirectUrl()).toBe('/login?returnUrl=%2Fcheckout');
  });
});
