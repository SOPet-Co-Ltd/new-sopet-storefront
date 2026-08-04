import { NextResponse } from 'next/server';
import { assertSameOrigin } from '@/lib/auth/bff-csrf';
import { clearAuthCookies } from '@/lib/auth/bff-cookies';

export async function POST(request: Request) {
  const csrfError = assertSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response, request);
  return response;
}
