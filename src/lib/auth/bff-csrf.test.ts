import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertSameOrigin } from './bff-csrf';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
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

  it('allows localhost Origin on next start (NODE_ENV=production, same request URL)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.NEXT_PUBLIC_STOREFRONT_URL;
    delete process.env.BFF_CSRF_ORIGINS;

    const request = new Request('http://localhost:3000/graphql', {
      method: 'POST',
      headers: { Origin: 'http://localhost:3000' },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });

  it('rejects localhost Origin against a production host (SOPET-M-11)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');
    delete process.env.NEXT_PUBLIC_STOREFRONT_URL;
    delete process.env.BFF_CSRF_ORIGINS;

    const request = new Request('https://www.sopet.org/graphql', {
      method: 'POST',
      headers: { Origin: 'http://localhost:3000' },
    });
    expect(assertSameOrigin(request)?.status).toBe(403);
  });

  it('allows NEXT_PUBLIC_BASE_URL when the request host is internal', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const request = new Request('http://127.0.0.1:3000/graphql', {
      method: 'POST',
      headers: { Origin: 'https://www.sopet.org' },
    });
    expect(assertSameOrigin(request)).toBeNull();
  });
});
