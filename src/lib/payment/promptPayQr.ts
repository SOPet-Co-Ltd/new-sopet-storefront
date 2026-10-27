const BASE64_MIME_PREFIXES: ReadonlyArray<readonly [string, string]> = [
  ['iVBOR', 'image/png'],
  ['/9j/', 'image/jpeg'],
  ['R0lGOD', 'image/gif'],
  ['UklGR', 'image/webp'],
  ['PHN2Zy', 'image/svg+xml'],
  ['PD94bW', 'image/svg+xml'],
];

function detectBase64ImageMime(base64: string): string {
  const match = BASE64_MIME_PREFIXES.find(([prefix]) => base64.startsWith(prefix));
  return match?.[1] ?? 'image/png';
}

/** Beam returns the PromptPay QR as base64 (optionally already a data URL). */
export function toQrImageDataUrl(qrCodeImage: string): string {
  const trimmed = qrCodeImage.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }

  const base64 = trimmed.replace(/\s/g, '');
  return `data:${detectBase64ImageMime(base64)};base64,${base64}`;
}

/** Prefer Beam `qrCodeImage` (data URL); fall back to legacy `qrCodeUrl` for historical payments. */
export function resolvePromptPayQrSrc(payment: {
  qrCodeImage?: string | null;
  qrCodeUrl?: string | null;
}): string | null {
  const image = payment.qrCodeImage?.trim();
  if (image) {
    return toQrImageDataUrl(image);
  }

  const url = payment.qrCodeUrl?.trim();
  return url || null;
}
