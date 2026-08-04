import { afterEach, describe, expect, it, vi } from 'vitest';
import { runSsrPreloadQueries } from '@/lib/graphql/ssr-preload';

describe('runSsrPreloadQueries', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns ok with data when the runner resolves', async () => {
    const result = await runSsrPreloadQueries('home', async () => ({ items: [1, 2] }));

    expect(result).toEqual({ ok: true, data: { items: [1, 2] } });
  });

  it('returns ok false and logs when the runner rejects', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('GraphQL SSR unavailable');

    const result = await runSsrPreloadQueries('search', async () => {
      throw failure;
    });

    expect(result).toEqual({ ok: false });
    expect(consoleError).toHaveBeenCalledWith('[ssr-preload]', 'search', failure);
  });
});
