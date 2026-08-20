import { describe, expect, it } from 'vitest';
import { harvestAuthTokens, redactAuthTokens } from './bff-upstream';
import { assertSameOrigin } from './bff-csrf';

describe('harvestAuthTokens', () => {
  it('harvests nested tokens payload', () => {
    expect(
      harvestAuthTokens({
        verifyCustomerOtp: {
          tokens: { accessToken: 'a', refreshToken: 'r' },
          customer: { id: '1' },
        },
      }),
    ).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('harvests refreshToken mutation shape', () => {
    expect(
      harvestAuthTokens({
        refreshToken: { accessToken: 'a2', refreshToken: 'r2' },
      }),
    ).toEqual({ accessToken: 'a2', refreshToken: 'r2' });
  });
});

describe('redactAuthTokens', () => {
  it('nulls JWT string fields', () => {
    expect(
      redactAuthTokens({
        verifyCustomerOtp: {
          tokens: { accessToken: 'a', refreshToken: 'r' },
          customer: { id: '1' },
        },
      }),
    ).toEqual({
      verifyCustomerOtp: {
        tokens: { accessToken: null, refreshToken: null },
        customer: { id: '1' },
      },
    });
  });
});

describe('assertSameOrigin', () => {
  it('allows localhost storefront origin', () => {
    const request = new Request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Origin: 'http://localhost:3000' },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });

  it('rejects foreign origin', () => {
    const request = new Request('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      headers: { Origin: 'https://evil.example' },
    });
    const rejected = assertSameOrigin(request);
    expect(rejected).not.toBeNull();
    expect(rejected?.status).toBe(403);
  });

  it('rejects missing Origin/Referer when APP_ENV is staging', () => {
    const prevAppEnv = process.env.APP_ENV;
    const prevAllow = process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN;
    process.env.APP_ENV = 'staging';
    delete process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN;
    try {
      const request = new Request('http://localhost:3000/graphql', { method: 'POST' });
      const rejected = assertSameOrigin(request);
      expect(rejected).not.toBeNull();
      expect(rejected?.status).toBe(403);
    } finally {
      if (prevAppEnv === undefined) {
        delete process.env.APP_ENV;
      } else {
        process.env.APP_ENV = prevAppEnv;
      }
      if (prevAllow === undefined) {
        delete process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN;
      } else {
        process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN = prevAllow;
      }
    }
  });

  it('allows missing Origin/Referer when BFF_CSRF_ALLOW_MISSING_ORIGIN=true', () => {
    const prevAppEnv = process.env.APP_ENV;
    const prevAllow = process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN;
    process.env.APP_ENV = 'staging';
    process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN = 'true';
    try {
      const request = new Request('http://localhost:3000/graphql', { method: 'POST' });
      expect(assertSameOrigin(request)).toBeNull();
    } finally {
      if (prevAppEnv === undefined) {
        delete process.env.APP_ENV;
      } else {
        process.env.APP_ENV = prevAppEnv;
      }
      if (prevAllow === undefined) {
        delete process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN;
      } else {
        process.env.BFF_CSRF_ALLOW_MISSING_ORIGIN = prevAllow;
      }
    }
  });
});
