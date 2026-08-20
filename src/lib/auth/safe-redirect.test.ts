import { describe, expect, it } from 'vitest';
import { getSafeRedirect, getSafeRedirectFromSearchParams } from './safe-redirect';

const ORIGIN = 'https://www.sopet.org';

describe('getSafeRedirect', () => {
  it('allows valid account paths', () => {
    expect(getSafeRedirect('/user', ORIGIN)).toBe('/user');
    expect(getSafeRedirect('/user/orders', ORIGIN)).toBe('/user/orders');
    expect(getSafeRedirect('/user/orders/abc-123', ORIGIN)).toBe('/user/orders/abc-123');
    expect(getSafeRedirect('/user/settings._~', ORIGIN)).toBe('/user/settings._~');
  });

  it('rejects null, empty, and non-path values', () => {
    expect(getSafeRedirect(null, ORIGIN)).toBeNull();
    expect(getSafeRedirect('', ORIGIN)).toBeNull();
    expect(getSafeRedirect('   ', ORIGIN)).toBeNull();
    expect(getSafeRedirect('user/orders', ORIGIN)).toBeNull();
    expect(getSafeRedirect('https://evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('javascript:alert(1)', ORIGIN)).toBeNull();
  });

  it('rejects protocol-relative and double-slash bypasses', () => {
    expect(getSafeRedirect('//evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('//evil.com/phish', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/\\evil', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/user//evil', ORIGIN)).toBeNull();
  });

  it('rejects encoded protocol-relative and slash bypasses', () => {
    expect(getSafeRedirect('/%2f%2f', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%2F%2Fevil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%5cevil', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/%40evil.com', ORIGIN)).toBeNull();
  });

  it('rejects @ credential / host-confusion forms', () => {
    expect(getSafeRedirect('/@evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/user@evil.com', ORIGIN)).toBeNull();
  });

  it('rejects query, hash, and unsafe characters', () => {
    expect(getSafeRedirect('/user?next=//evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/user#//evil.com', ORIGIN)).toBeNull();
    expect(getSafeRedirect('/user/<script>', ORIGIN)).toBeNull();
  });
});

describe('getSafeRedirectFromSearchParams', () => {
  it('prefers next over returnUrl', () => {
    const params = new URLSearchParams({
      next: '/user/orders',
      returnUrl: '/user/favorites',
    });
    expect(getSafeRedirectFromSearchParams(params, ORIGIN)).toBe('/user/orders');
  });

  it('falls back to returnUrl when next is missing or unsafe', () => {
    expect(
      getSafeRedirectFromSearchParams(new URLSearchParams({ returnUrl: '/user/credit' }), ORIGIN),
    ).toBe('/user/credit');
    expect(
      getSafeRedirectFromSearchParams(
        new URLSearchParams({ next: '//evil.com', returnUrl: '/user/credit' }),
        ORIGIN,
      ),
    ).toBe('/user/credit');
  });
});
