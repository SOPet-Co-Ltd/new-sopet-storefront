import { afterEach, describe, expect, it, vi } from 'vitest';

import robots from './robots';

const EXPECTED_DISALLOW = [
  '/user/',
  '/login',
  '/signout',
  '/login/otp',
  '/cart',
  '/checkout',
  '/payment/',
  '/track/',
  '/order/',
  '/thank-you/',
  '/recommend',
  '/search',
];

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('robots', () => {
  it('returns sitemap URL and exact disallow list', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const result = robots();

    expect(result.sitemap).toBe('https://www.sopet.org/sitemap.xml');
    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: EXPECTED_DISALLOW,
    });
  });
});
