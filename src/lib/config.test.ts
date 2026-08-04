import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildGraphqlSsrBypassHeaders,
  getGraphqlSsrBypassSecret,
  GRAPHQL_SSR_BYPASS_HEADER,
} from './config';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('getGraphqlSsrBypassSecret', () => {
  it('returns undefined when env is unset', () => {
    vi.stubGlobal('window', undefined);
    vi.stubEnv('GRAPHQL_SSR_BYPASS_SECRET', undefined as unknown as string);
    delete process.env.GRAPHQL_SSR_BYPASS_SECRET;
    expect(getGraphqlSsrBypassSecret()).toBeUndefined();
  });

  it('returns trimmed secret on the server', () => {
    vi.stubGlobal('window', undefined);
    vi.stubEnv('GRAPHQL_SSR_BYPASS_SECRET', '  ssr-secret-value  ');
    expect(getGraphqlSsrBypassSecret()).toBe('ssr-secret-value');
  });

  it('returns undefined in the browser even when env is set', () => {
    vi.stubEnv('GRAPHQL_SSR_BYPASS_SECRET', 'ssr-secret-value');
    vi.stubGlobal('window', {});
    expect(getGraphqlSsrBypassSecret()).toBeUndefined();
  });
});

describe('buildGraphqlSsrBypassHeaders', () => {
  it('omits the bypass header when secret is unset', () => {
    expect(buildGraphqlSsrBypassHeaders(undefined)).toEqual({});
  });

  it('includes x-sopet-ssr-bypass when secret is provided', () => {
    expect(buildGraphqlSsrBypassHeaders('ssr-secret-value')).toEqual({
      [GRAPHQL_SSR_BYPASS_HEADER]: 'ssr-secret-value',
    });
  });

  it('reads from env when no secret argument is passed', () => {
    vi.stubGlobal('window', undefined);
    vi.stubEnv('GRAPHQL_SSR_BYPASS_SECRET', 'from-env');
    expect(buildGraphqlSsrBypassHeaders()).toEqual({
      [GRAPHQL_SSR_BYPASS_HEADER]: 'from-env',
    });
  });
});
