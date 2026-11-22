import { afterEach, describe, expect, it, vi } from 'vitest';

const fetchApprovedCategoriesMock = vi.fn();

vi.mock('@/lib/seo/fetch', () => ({
  fetchApprovedCategories: (...args: unknown[]) => fetchApprovedCategoriesMock(...args),
}));

import { GET, revalidate } from './route';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  fetchApprovedCategoriesMock.mockReset();
});

describe('llms.txt route', () => {
  it('exports revalidate 86400', () => {
    expect(revalidate).toBe(86400);
  });

  it('returns plain text with live approved category URLs under 10 KB', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'Sopet');
    fetchApprovedCategoriesMock.mockResolvedValue([
      { name: 'Dog Food', slug: 'dog-food' },
      { name: 'Cat Food', slug: 'cat-food' },
    ]);

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
    expect(body).toContain('https://www.sopet.org/categories/cat-food');
    expect(body).toContain('https://www.sopet.org/policy/privacy-policy');
    expect(body).toContain('https://www.sopet.org/security');
    expect(body).toContain("Each product page includes that product's customer rating and reviews");
  });

  it('omits category lines when the category fetch fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');
    fetchApprovedCategoriesMock.mockResolvedValue(null);

    const response = await GET();
    const body = await response.text();

    expect(body).toContain('https://www.sopet.org/');
    expect(body).not.toMatch(/https:\/\/www\.sopet\.org\/categories\/[a-z0-9-]+/);
    expect(body).toContain('Category listing: https://www.sopet.org/categories/{slug}');
    expect(body).toContain('https://www.sopet.org/policy/privacy-policy');
  });

  it('does not expose internal API hosts or localhost backend URLs', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://www.sopet.org');
    fetchApprovedCategoriesMock.mockResolvedValue([{ name: 'Dog Food', slug: 'dog-food' }]);

    const response = await GET();
    const body = await response.text();

    expect(body).not.toMatch(/\/graphql|localhost:3002|127\.0\.0\.1|:3002/);
  });
});
