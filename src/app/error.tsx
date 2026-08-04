'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/util/ErrorFallback';

export default function RootError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorFallback onRetry={unstable_retry} />;
}
