import { NextResponse } from 'next/server';
import { isAuthenticatedFromCookies } from '@/lib/auth/bff-cookies';

export async function GET() {
  const authenticated = await isAuthenticatedFromCookies();
  return NextResponse.json({ authenticated });
}
