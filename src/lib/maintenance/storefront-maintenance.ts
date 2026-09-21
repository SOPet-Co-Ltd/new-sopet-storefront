import { buildGraphqlSsrBypassHeaders, getGraphqlSsrBypassSecret } from '@/lib/config';

const DEFAULT_SSR_GRAPHQL_URL = 'http://localhost:3002/graphql';

function getMaintenanceGraphqlUrl(): string {
  return process.env.GRAPHQL_SSR_URL ?? DEFAULT_SSR_GRAPHQL_URL;
}

const STOREFRONT_MAINTENANCE_QUERY = `
  query StorefrontMaintenance {
    storefrontMaintenance {
      enabled
      reason
      customMessage
      untilAt
    }
  }
`;

/** Paths that must remain reachable while the storefront is closed. */
const MAINTENANCE_EXEMPT_PREFIXES = ['/maintenance', '/_next', '/graphql', '/api'] as const;

const STATIC_FILE_EXT = /\.(?:ico|png|jpg|jpeg|gif|webp|svg|txt|xml|json|js|css|map|woff2?)$/i;

export type StorefrontMaintenanceReason = 'MAINTENANCE' | 'NOT_READY' | 'SYSTEM_UPDATE' | 'OTHER';

export type StorefrontMaintenanceStatus = {
  enabled: boolean;
  reason: StorefrontMaintenanceReason | null;
  customMessage: string | null;
  untilAt: string | null;
};

const DEFAULT_STATUS: StorefrontMaintenanceStatus = {
  enabled: false,
  reason: null,
  customMessage: null,
  untilAt: null,
};

const REASON_HEADLINES: Record<StorefrontMaintenanceReason, string> = {
  MAINTENANCE: 'หน้าร้านปิดปรับปรุงชั่วคราว',
  NOT_READY: 'หน้าร้านยังไม่เปิดให้ใช้',
  SYSTEM_UPDATE: 'กำลังอัพเดทระบบ',
  OTHER: 'หน้าร้านปิดชั่วคราว',
};

const REASON_BODIES: Record<Exclude<StorefrontMaintenanceReason, 'OTHER'>, string> = {
  MAINTENANCE: 'ขณะนี้หน้าร้านกำลังปิดปรับปรุง กรุณากลับมาใหม่อีกครั้งในภายหลัง',
  NOT_READY: 'ขณะนี้หน้าร้านยังไม่พร้อมให้บริการ กรุณากลับมาใหม่อีกครั้งในภายหลัง',
  SYSTEM_UPDATE: 'ขณะนี้ระบบกำลังได้รับการอัพเดท กรุณากลับมาใหม่อีกครั้งในภายหลัง',
};

let cachedStatus: StorefrontMaintenanceStatus | null = null;
let cachedAtMs = 0;
const CACHE_TTL_MS = 30_000;

export function shouldSkipMaintenanceRedirect(pathname: string): boolean {
  if (STATIC_FILE_EXT.test(pathname)) {
    return true;
  }
  return MAINTENANCE_EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isMaintenancePath(pathname: string): boolean {
  return pathname === '/maintenance' || pathname.startsWith('/maintenance/');
}

function isReason(value: unknown): value is StorefrontMaintenanceReason {
  return (
    value === 'MAINTENANCE' ||
    value === 'NOT_READY' ||
    value === 'SYSTEM_UPDATE' ||
    value === 'OTHER'
  );
}

function normalizeStatus(raw: unknown): StorefrontMaintenanceStatus {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STATUS };
  }
  const record = raw as Record<string, unknown>;
  return {
    enabled: record.enabled === true,
    reason: isReason(record.reason) ? record.reason : null,
    customMessage:
      typeof record.customMessage === 'string' && record.customMessage.trim()
        ? record.customMessage.trim()
        : null,
    untilAt:
      typeof record.untilAt === 'string' && record.untilAt.trim() ? record.untilAt.trim() : null,
  };
}

/**
 * Full public maintenance status from the API.
 * Fail-open: returns disabled defaults when the fetch fails.
 */
export async function getStorefrontMaintenanceStatus(
  fetchImpl: typeof fetch = fetch,
  options?: { bypassCache?: boolean },
): Promise<StorefrontMaintenanceStatus> {
  const now = Date.now();
  if (!options?.bypassCache && cachedStatus !== null && now - cachedAtMs < CACHE_TTL_MS) {
    return cachedStatus;
  }

  try {
    const response = await fetchImpl(getMaintenanceGraphqlUrl(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...buildGraphqlSsrBypassHeaders(getGraphqlSsrBypassSecret()),
      },
      body: JSON.stringify({ query: STOREFRONT_MAINTENANCE_QUERY }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return { ...DEFAULT_STATUS };
    }

    const json = (await response.json()) as {
      data?: { storefrontMaintenance?: unknown };
      errors?: unknown[];
    };

    if (json.errors?.length) {
      return { ...DEFAULT_STATUS };
    }

    const status = normalizeStatus(json.data?.storefrontMaintenance);
    cachedStatus = status;
    cachedAtMs = now;
    return status;
  } catch {
    return { ...DEFAULT_STATUS };
  }
}

/**
 * Public maintenance flag from the API.
 * Fail-open: returns false when the fetch fails so an API blip does not close the site.
 */
export async function isStorefrontMaintenanceEnabled(
  fetchImpl: typeof fetch = fetch,
  options?: { bypassCache?: boolean },
): Promise<boolean> {
  const status = await getStorefrontMaintenanceStatus(fetchImpl, options);
  return status.enabled;
}

export function getMaintenancePageCopy(status: StorefrontMaintenanceStatus): {
  title: string;
  message: string;
  untilLabel: string | null;
} {
  const reason = status.reason;
  const title = reason ? REASON_HEADLINES[reason] : REASON_HEADLINES.MAINTENANCE;
  let message: string;
  if (reason === 'OTHER' && status.customMessage) {
    message = status.customMessage;
  } else if (reason && reason !== 'OTHER') {
    message = REASON_BODIES[reason];
  } else {
    message = REASON_BODIES.MAINTENANCE;
  }

  return {
    title,
    message,
    untilLabel: formatUntilLabel(status.untilAt),
  };
}

function formatUntilLabel(untilAt: string | null): string | null {
  if (!untilAt) return null;
  const date = new Date(untilAt);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = date.toLocaleString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `เปิดอีกครั้งประมาณ ${formatted}`;
}

/** Test helper — clears the in-process maintenance cache. */
export function resetStorefrontMaintenanceCache(): void {
  cachedStatus = null;
  cachedAtMs = 0;
}
