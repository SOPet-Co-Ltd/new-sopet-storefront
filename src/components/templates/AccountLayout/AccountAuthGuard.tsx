'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { prefetchAllAccountPages } from '@/lib/account/prefetchAccountPage';
import { getSafeRedirect } from '@/lib/auth/safe-redirect';
import { useAuth } from '@/lib/hooks/useAuth';

type AccountAuthGuardProps = {
  children: ReactNode;
};

export function AccountAuthGuard({ children }: AccountAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next = getSafeRedirect(pathname);
      const loginPath = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
      router.replace(loginPath);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    const warmAccountCache = () => prefetchAllAccountPages();

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(warmAccountCache);
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = globalThis.setTimeout(warmAccountCache, 200);
    return () => globalThis.clearTimeout(timerId);
  }, [isAuthenticated, isLoading]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 lg:px-20" data-testid="account-auth-loading">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-sop-8px bg-sop-neutral-gray-500" />
          <div className="h-64 rounded-sop-16px bg-sop-neutral-gray-500" />
        </div>
      </div>
    );
  }

  return children;
}
