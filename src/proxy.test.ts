import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/maintenance/storefront-maintenance', async () => {
  const actual = await vi.importActual<typeof import('@/lib/maintenance/storefront-maintenance')>(
    '@/lib/maintenance/storefront-maintenance',
  );
  return {
    ...actual,
    isStorefrontMaintenanceEnabled: vi.fn(),
  };
});

import { proxy } from '@/proxy';
import { isStorefrontMaintenanceEnabled } from '@/lib/maintenance/storefront-maintenance';

const mockedIsEnabled = vi.mocked(isStorefrontMaintenanceEnabled);

function request(path: string, cookie?: string) {
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', cookie);
  }
  return new NextRequest(new URL(path, 'http://localhost:3000'), { headers });
}

describe('proxy maintenance gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /maintenance when enabled', async () => {
    mockedIsEnabled.mockResolvedValue(true);
    const response = await proxy(request('/search'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/maintenance');
  });

  it('redirects /maintenance to home when disabled', async () => {
    mockedIsEnabled.mockResolvedValue(false);
    const response = await proxy(request('/maintenance'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
    expect(mockedIsEnabled).toHaveBeenCalledWith(fetch, { bypassCache: true });
  });

  it('allows /maintenance when enabled and bypasses cache', async () => {
    mockedIsEnabled.mockResolvedValue(true);
    const response = await proxy(request('/maintenance'));
    expect(response.status).toBe(200);
    expect(mockedIsEnabled).toHaveBeenCalledWith(fetch, { bypassCache: true });
  });

  it('still gates /user when maintenance is off', async () => {
    mockedIsEnabled.mockResolvedValue(false);
    const response = await proxy(request('/user/orders'));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });
});
