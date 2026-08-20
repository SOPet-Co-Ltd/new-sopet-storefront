/**
 * Validates CMS-driven hrefs before rendering links.
 * Rejects protocol-relative URLs (`//evil.com`) and dangerous schemes.
 */
export function sanitizeExternalUrl(href: string | null | undefined): string | null {
  if (!href) {
    return null;
  }

  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('//')) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  return null;
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

const PAYMENT_REDIRECT_ALLOWED_HOSTS = new Set([
  'pay.omise.co',
  'api.omise.co',
  'vault.omise.co',
  'cdn.omise.co',
]);

function hostnameMatchesAllowlist(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (PAYMENT_REDIRECT_ALLOWED_HOSTS.has(normalized)) {
    return true;
  }

  return normalized.endsWith('.omise.co');
}

/**
 * Allowlist Omise and card-issuer hosts for 3DS authorizeUri redirects.
 */
export function sanitizePaymentRedirectUrl(uri: string | null | undefined): string | null {
  if (!uri) {
    return null;
  }

  const trimmed = uri.trim();
  if (!trimmed || trimmed.startsWith('//')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const allowHttp = process.env.NODE_ENV !== 'production';
    if (parsed.protocol === 'https:') {
      // ok
    } else if (parsed.protocol === 'http:' && allowHttp) {
      // local / test Omise mocks only
    } else {
      return null;
    }

    if (!hostnameMatchesAllowlist(parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
