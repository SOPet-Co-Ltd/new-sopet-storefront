import { describe, expect, it } from 'vitest';
import {
  buildUpstreamRequestHeaders,
  getIncomingClientIp,
  harvestAuthTokens,
  redactAuthTokens,
} from './bff-upstream';

describe('getIncomingClientIp / buildUpstreamRequestHeaders', () => {
  it('forwards x-request-id and stamps the visitor IP for rate limits', () => {
    const request = new Request('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'x-request-id': 'req-browser-1',
        'x-forwarded-for': '203.0.113.10',
      },
    });

    expect(buildUpstreamRequestHeaders(request, { sessionId: 'session-1' })).toEqual({
      'x-request-id': 'req-browser-1',
      'x-sopet-client-ip': '203.0.113.10',
      'x-forwarded-for': '203.0.113.10',
      'x-sopet-session-id': 'session-1',
    });
  });

  it('prefers x-vercel-forwarded-for over a Vercel egress hop in x-forwarded-for', () => {
    const request = new Request('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '3.82.112.93',
        'x-vercel-forwarded-for': '203.0.113.10',
      },
    });

    expect(getIncomingClientIp(request)).toBe('203.0.113.10');
    expect(buildUpstreamRequestHeaders(request)).toEqual({
      'x-request-id': expect.any(String),
      'x-sopet-client-ip': '203.0.113.10',
      'x-forwarded-for': '203.0.113.10',
    });
  });

  it('uses x-real-ip when x-forwarded-for is absent', () => {
    const request = new Request('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'x-real-ip': '198.51.100.7',
      },
    });

    expect(buildUpstreamRequestHeaders(request)).toEqual({
      'x-request-id': expect.any(String),
      'x-sopet-client-ip': '198.51.100.7',
      'x-forwarded-for': '198.51.100.7',
    });
  });

  it('generates x-request-id when the browser did not send one', () => {
    const request = new Request('http://localhost:3000/graphql', { method: 'POST' });
    const headers = buildUpstreamRequestHeaders(request);

    expect(headers['x-request-id']).toEqual(expect.any(String));
    expect(headers['x-request-id']?.length).toBeGreaterThan(0);
    expect(headers).not.toHaveProperty('x-forwarded-for');
    expect(headers).not.toHaveProperty('x-sopet-client-ip');
  });

  it('still stamps session id when no incoming request is available', () => {
    expect(buildUpstreamRequestHeaders(undefined, { sessionId: 'guest-1' })).toEqual({
      'x-sopet-session-id': 'guest-1',
    });
  });
});

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
