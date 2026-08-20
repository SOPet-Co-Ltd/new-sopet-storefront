import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isExternalHref,
  sanitizeExternalUrl,
  sanitizePaymentRedirectUrl,
} from './sanitize-external-url';

describe('sanitizeExternalUrl', () => {
  it('allows https, http, and same-origin paths', () => {
    expect(sanitizeExternalUrl('https://track.example.com/1')).toBe('https://track.example.com/1');
    expect(sanitizeExternalUrl('http://track.example.com/1')).toBe('http://track.example.com/1');
    expect(sanitizeExternalUrl('/relative/path')).toBe('/relative/path');
  });

  it('rejects protocol-relative and dangerous schemes', () => {
    expect(sanitizeExternalUrl('//evil.com')).toBeNull();
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl('data:text/html,hi')).toBeNull();
    expect(sanitizeExternalUrl('')).toBeNull();
    expect(sanitizeExternalUrl(null)).toBeNull();
  });
});

describe('isExternalHref', () => {
  it('detects absolute http(s) hrefs', () => {
    expect(isExternalHref('https://example.com')).toBe(true);
    expect(isExternalHref('/path')).toBe(false);
  });
});

describe('sanitizePaymentRedirectUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('allows Omise https authorize URIs', () => {
    expect(sanitizePaymentRedirectUrl('https://pay.omise.co/payments/pay_test_123/authorize')).toBe(
      'https://pay.omise.co/payments/pay_test_123/authorize',
    );
  });

  it('allows http Omise URIs outside production', () => {
    vi.stubEnv('NODE_ENV', 'test');
    expect(sanitizePaymentRedirectUrl('http://pay.omise.co/payments/pay_test_123/authorize')).toBe(
      'http://pay.omise.co/payments/pay_test_123/authorize',
    );
  });

  it('rejects http Omise URIs in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(
      sanitizePaymentRedirectUrl('http://pay.omise.co/payments/pay_test_123/authorize'),
    ).toBeNull();
  });

  it('rejects non-allowlisted hosts and dangerous schemes', () => {
    expect(sanitizePaymentRedirectUrl('https://evil.example/phish')).toBeNull();
    expect(sanitizePaymentRedirectUrl('//pay.omise.co/x')).toBeNull();
    expect(sanitizePaymentRedirectUrl('javascript:alert(1)')).toBeNull();
  });
});
