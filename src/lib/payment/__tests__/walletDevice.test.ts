import { describe, expect, it } from 'vitest';
import { isOmiseWalletApiPaymentMethod, resolveOmiseWalletPlatformType } from '../walletDevice';

describe('resolveOmiseWalletPlatformType', () => {
  it('detects iPhone as IOS', () => {
    expect(
      resolveOmiseWalletPlatformType(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      ),
    ).toBe('IOS');
  });

  it('detects Android as ANDROID', () => {
    expect(
      resolveOmiseWalletPlatformType(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      ),
    ).toBe('ANDROID');
  });

  it('detects desktop as WEB', () => {
    expect(
      resolveOmiseWalletPlatformType(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      ),
    ).toBe('WEB');
  });
});

describe('isOmiseWalletApiPaymentMethod', () => {
  it('detects wallet methods', () => {
    expect(isOmiseWalletApiPaymentMethod('truemoney')).toBe(true);
    expect(isOmiseWalletApiPaymentMethod('shopeepay')).toBe(true);
    expect(isOmiseWalletApiPaymentMethod('promptpay')).toBe(false);
  });
});
