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

const BEAM_SANDBOX_CHARGE_ID = /\/charges\/(c_[A-Za-z0-9]+)(?:\/|$)/;

/**
 * Reference the payer sees from Beam, taken from the QR payload (`encodedImage.rawData`).
 * Playground charges encode a checkout URL whose id Beam prints on that page.
 * Live PromptPay charges encode an EMV QR; banking apps show Additional Data tag 62
 * reference label (05), then bill number (01).
 * Falls back to the SOPET payment id when the payload has no payer reference
 * (legacy image URLs, or a QR with no additional-data reference).
 */
export function resolvePromptPayReferenceId(
  rawQr: string | null | undefined,
  paymentId: string,
): string {
  const raw = rawQr?.trim();
  if (!raw) {
    return paymentId;
  }

  return referenceFromBeamChargeUrl(raw) ?? referenceFromEmvQr(raw) ?? paymentId;
}

function referenceFromBeamChargeUrl(raw: string): string | null {
  if (!/^https?:\/\//i.test(raw)) {
    return null;
  }

  try {
    const match = new URL(raw).pathname.match(BEAM_SANDBOX_CHARGE_ID);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function referenceFromEmvQr(payload: string): string | null {
  if (!payload.startsWith('000201')) {
    return null;
  }

  const fields = readEmvTlv(payload);
  const additional = fields?.get('62');
  if (!additional) {
    return null;
  }

  const nested = readEmvTlv(additional);
  if (!nested) {
    return null;
  }

  const reference = nested.get('05')?.trim() || nested.get('01')?.trim();
  return reference || null;
}

/** EMV TLV: 2-digit id, 2-digit decimal length, value. Returns null if the string is not exact TLV. */
function readEmvTlv(payload: string): Map<string, string> | null {
  const fields = new Map<string, string>();
  let index = 0;

  while (index + 4 <= payload.length) {
    const id = payload.slice(index, index + 2);
    const lengthText = payload.slice(index + 2, index + 4);
    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(lengthText)) {
      return null;
    }

    const length = Number(lengthText);
    const start = index + 4;
    const end = start + length;
    if (end > payload.length) {
      return null;
    }

    fields.set(id, payload.slice(start, end));
    index = end;
  }

  if (index !== payload.length) {
    return null;
  }

  return fields;
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
