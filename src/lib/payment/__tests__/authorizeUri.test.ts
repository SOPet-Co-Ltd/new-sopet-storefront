import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAllowed3dsAuthorizeHostSuffixes, isAllowed3dsAuthorizeUri } from '../authorizeUri';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('isAllowed3dsAuthorizeUri', () => {
  it('allows https Omise pay host', () => {
    expect(isAllowed3dsAuthorizeUri('https://pay.omise.co/offsites/ofsp_test/pay')).toBe(true);
  });

  it('allows apex and nested Omise hosts', () => {
    expect(isAllowed3dsAuthorizeUri('https://omise.co/path')).toBe(true);
    expect(isAllowed3dsAuthorizeUri('https://3ds.pay.omise.co/auth')).toBe(true);
  });

  it('allows documented ACS host suffixes', () => {
    expect(
      isAllowed3dsAuthorizeUri('https://songbird.cardinalcommerce.com/cardinalcruise/v1'),
    ).toBe(true);
    expect(isAllowed3dsAuthorizeUri('https://secure4.arcot.com/acspage/cap')).toBe(true);
  });

  it('rejects http and non-http schemes', () => {
    expect(isAllowed3dsAuthorizeUri('http://pay.omise.co/offsites/ofsp_test/pay')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('javascript:alert(1)')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('data:text/html,hi')).toBe(false);
  });

  it('rejects unknown hosts and suffix lookalikes', () => {
    expect(isAllowed3dsAuthorizeUri('https://evil.example/phish')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('https://pay.omise.co.evil.example/pay')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('https://notomise.co/pay')).toBe(false);
  });

  it('rejects credentials in userinfo and empty/invalid input', () => {
    expect(isAllowed3dsAuthorizeUri('https://user:pass@pay.omise.co/pay')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('   ')).toBe(false);
    expect(isAllowed3dsAuthorizeUri('not-a-url')).toBe(false);
  });

  it('allows extra host suffixes from env', () => {
    vi.stubEnv('NEXT_PUBLIC_THREE_DS_AUTHORIZE_HOST_SUFFIXES', 'bank-acs.example, acs.test');
    expect(getAllowed3dsAuthorizeHostSuffixes()).toEqual(
      expect.arrayContaining(['omise.co', 'bank-acs.example', 'acs.test']),
    );
    expect(isAllowed3dsAuthorizeUri('https://stepup.bank-acs.example/3ds')).toBe(true);
  });
});
