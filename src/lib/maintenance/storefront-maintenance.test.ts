import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  getMaintenancePageCopy,
  getStorefrontMaintenanceStatus,
  isMaintenancePath,
  isStorefrontMaintenanceEnabled,
  resetStorefrontMaintenanceCache,
  shouldSkipMaintenanceRedirect,
} from './storefront-maintenance';

describe('shouldSkipMaintenanceRedirect', () => {
  it('skips maintenance, next, graphql, api, and static files', () => {
    expect(shouldSkipMaintenanceRedirect('/maintenance')).toBe(true);
    expect(shouldSkipMaintenanceRedirect('/maintenance/extra')).toBe(true);
    expect(shouldSkipMaintenanceRedirect('/_next/static/chunk.js')).toBe(true);
    expect(shouldSkipMaintenanceRedirect('/graphql')).toBe(true);
    expect(shouldSkipMaintenanceRedirect('/api/auth/session')).toBe(true);
    expect(shouldSkipMaintenanceRedirect('/images/logo.webp')).toBe(true);
    expect(shouldSkipMaintenanceRedirect('/')).toBe(false);
    expect(shouldSkipMaintenanceRedirect('/search')).toBe(false);
  });
});

describe('isMaintenancePath', () => {
  it('matches /maintenance only', () => {
    expect(isMaintenancePath('/maintenance')).toBe(true);
    expect(isMaintenancePath('/maintenance/')).toBe(true);
    expect(isMaintenancePath('/search')).toBe(false);
  });
});

describe('isStorefrontMaintenanceEnabled', () => {
  beforeEach(() => {
    resetStorefrontMaintenanceCache();
  });

  it('returns true when API reports enabled', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          storefrontMaintenance: {
            enabled: true,
            reason: 'MAINTENANCE',
            customMessage: null,
            untilAt: null,
          },
        },
      }),
    });

    await expect(isStorefrontMaintenanceEnabled(fetchImpl)).resolves.toBe(true);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('fail-opens on network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(isStorefrontMaintenanceEnabled(fetchImpl)).resolves.toBe(false);
  });

  it('fail-opens on non-ok response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    await expect(isStorefrontMaintenanceEnabled(fetchImpl)).resolves.toBe(false);
  });

  it('caches successful result within TTL', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          storefrontMaintenance: {
            enabled: false,
            reason: null,
            customMessage: null,
            untilAt: null,
          },
        },
      }),
    });

    await expect(isStorefrontMaintenanceEnabled(fetchImpl)).resolves.toBe(false);
    await expect(isStorefrontMaintenanceEnabled(fetchImpl)).resolves.toBe(false);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it('bypassCache forces a fresh fetch', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            storefrontMaintenance: {
              enabled: true,
              reason: 'MAINTENANCE',
              customMessage: null,
              untilAt: null,
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            storefrontMaintenance: {
              enabled: false,
              reason: null,
              customMessage: null,
              untilAt: null,
            },
          },
        }),
      });

    await expect(isStorefrontMaintenanceEnabled(fetchImpl)).resolves.toBe(true);
    await expect(isStorefrontMaintenanceEnabled(fetchImpl, { bypassCache: true })).resolves.toBe(
      false,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('getStorefrontMaintenanceStatus', () => {
  beforeEach(() => {
    resetStorefrontMaintenanceCache();
  });

  it('returns reason fields from API', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          storefrontMaintenance: {
            enabled: true,
            reason: 'OTHER',
            customMessage: 'ย้ายเซิร์ฟเวอร์',
            untilAt: '2099-01-01T00:00:00.000Z',
          },
        },
      }),
    });

    await expect(getStorefrontMaintenanceStatus(fetchImpl)).resolves.toEqual({
      enabled: true,
      reason: 'OTHER',
      customMessage: 'ย้ายเซิร์ฟเวอร์',
      untilAt: '2099-01-01T00:00:00.000Z',
    });
  });
});

describe('getMaintenancePageCopy', () => {
  it('uses custom message for OTHER', () => {
    const copy = getMaintenancePageCopy({
      enabled: true,
      reason: 'OTHER',
      customMessage: 'กำลังย้ายเซิร์ฟเวอร์',
      untilAt: null,
    });
    expect(copy.title).toBe('หน้าร้านปิดชั่วคราว');
    expect(copy.message).toBe('กำลังย้ายเซิร์ฟเวอร์');
    expect(copy.untilLabel).toBeNull();
  });

  it('formats until label for preset reasons', () => {
    const copy = getMaintenancePageCopy({
      enabled: true,
      reason: 'SYSTEM_UPDATE',
      customMessage: null,
      untilAt: '2099-06-01T12:00:00.000Z',
    });
    expect(copy.title).toBe('กำลังอัพเดทระบบ');
    expect(copy.message).toMatch(/อัพเดท/);
    expect(copy.untilLabel).toMatch(/เปิดอีกครั้งประมาณ/);
  });
});
