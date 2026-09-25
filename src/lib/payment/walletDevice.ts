export type OmiseWalletPlatformType = 'IOS' | 'ANDROID' | 'WEB';

const MOBILE_UA_PATTERN = /iPhone|iPad|iPod|Android/i;

/**
 * Omise JumpApp platform_type hint from User-Agent.
 * JumpApp is used for both desktop and mobile; platform_type only optimizes the redirect.
 */
export function resolveOmiseWalletPlatformType(
  userAgent: string | null | undefined = typeof navigator !== 'undefined'
    ? navigator.userAgent
    : '',
): OmiseWalletPlatformType {
  const ua = userAgent ?? '';
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'IOS';
  }
  if (/Android/i.test(ua)) {
    return 'ANDROID';
  }
  if (MOBILE_UA_PATTERN.test(ua)) {
    return 'WEB';
  }
  return 'WEB';
}

export function isOmiseWalletApiPaymentMethod(method: string): method is 'truemoney' | 'shopeepay' {
  return method === 'truemoney' || method === 'shopeepay';
}
