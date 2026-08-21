/**
 * Allowlist for payment.authorizeUri before window.location / <a href> navigation.
 * Omise returns https://pay.omise.co/...; ACS hosts are included for rare direct ACS URIs.
 */

const DEFAULT_HOST_SUFFIXES: readonly string[] = [
  'omise.co',
  // Documented EMV 3DS ACS / method-URL intermediaries (suffix match)
  'cardinalcommerce.com',
  'arcot.com',
];

function hostMatchesSuffix(hostname: string, suffix: string): boolean {
  const host = hostname.toLowerCase();
  const allowed = suffix.toLowerCase();
  return host === allowed || host.endsWith(`.${allowed}`);
}

function readExtraHostSuffixes(): string[] {
  const raw = process.env.NEXT_PUBLIC_THREE_DS_AUTHORIZE_HOST_SUFFIXES?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/** Host suffixes allowed for 3DS / offsite authorize navigation. */
export function getAllowed3dsAuthorizeHostSuffixes(): string[] {
  return [...DEFAULT_HOST_SUFFIXES, ...readExtraHostSuffixes()];
}

/**
 * Returns true when `uri` is https-only and its hostname matches an allowlisted suffix.
 * Rejects credentials in the URL userinfo, non-https schemes, and parse failures.
 */
export function isAllowed3dsAuthorizeUri(uri: string): boolean {
  const trimmed = uri.trim();
  if (!trimmed) return false;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'https:') return false;
  if (parsed.username || parsed.password) return false;

  const hostname = parsed.hostname;
  if (!hostname) return false;

  return getAllowed3dsAuthorizeHostSuffixes().some((suffix) => hostMatchesSuffix(hostname, suffix));
}
