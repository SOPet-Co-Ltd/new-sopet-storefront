'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/util/ErrorFallback';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="th">
      <body>
        <ErrorFallback onRetry={unstable_retry} />
      </body>
    </html>
  );
}
