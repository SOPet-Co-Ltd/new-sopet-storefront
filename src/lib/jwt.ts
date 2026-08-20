import { jwtVerify, type JWTPayload } from 'jose';

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function verifyJwtPayload(token: string): Promise<JWTPayload | null> {
  const secret = getJwtSecret();
  if (!secret) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER?.trim() || 'sopet',
      audience: process.env.JWT_AUDIENCE?.trim() || 'sopet-api',
    });
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpiredFromPayload(payload: Record<string, unknown> | JWTPayload): boolean {
  const exp = payload.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= Date.now();
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  return isTokenExpiredFromPayload(payload);
}
