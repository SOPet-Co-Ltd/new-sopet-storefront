import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET, revalidate } from './route';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
});

describe('llms.txt route', () => {
  it('exports revalidate 86400', () => {
    expect(revalidate).toBe(86400);
  });

  it('returns plain text with curated absolute URLs under 10 KB', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'Sopet');

    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/plain');
    expect(response.headers.get('content-type')).toContain('charset=utf-8');

    const absoluteUrls = body.match(/https:\/\/[^\s]+/g) ?? [];
    expect(absoluteUrls.length).toBeGreaterThanOrEqual(5);
    expect(new TextEncoder().encode(body).length).toBeLessThan(10 * 1024);

    expect(body).toContain('https://www.sopet.org/');
    expect(body).toContain('https://www.sopet.org/categories/dog-food');
    expect(body).toContain('https://www.sopet.org/policy/privacy-policy');
  });

  it('does not expose internal API hosts or localhost backend URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');

    const response = await GET();
    const body = await response.text();

    expect(body).not.toMatch(/\/graphql|localhost:3002|127\.0\.0\.1|:3002/);
  });
});
