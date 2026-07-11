export type CheckoutAddressDisplayMode =
  'guest' | 'auth-inline' | 'auth-summary' | 'auth-loading' | 'auth-error';

export function resolveDisplayMode(input: {
  isAuthenticated: boolean;
  loading: boolean;
  error: Error | undefined;
  addressCount: number;
}): CheckoutAddressDisplayMode {
  if (!input.isAuthenticated) return 'guest';
  if (input.loading) return 'auth-loading';
  if (input.error) return 'auth-error';
  if (input.addressCount === 0) return 'auth-inline';
  return 'auth-summary';
}
