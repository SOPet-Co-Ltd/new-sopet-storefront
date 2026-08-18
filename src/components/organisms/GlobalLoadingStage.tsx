'use client';

import { useLottie } from 'lottie-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import runningDogAnimation from '@/assets/lottie/runningDog.json';

type LoadingOverlayContextValue = {
  /** Boot-time Lottie instance has painted (SVG ready). */
  ready: boolean;
  show: () => void;
  hide: () => void;
};

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

/**
 * Boots one Lottie player on first hydrate (kept alive for the session).
 * `app/loading.tsx` only toggles this overlay — it never mounts a second player —
 * so the dog is already loaded before the loading screen is revealed.
 */
export function LoadingLottieWarmupProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [holdCount, setHoldCount] = useState(0);

  const show = useCallback(() => {
    setHoldCount((count) => count + 1);
  }, []);

  const hide = useCallback(() => {
    setHoldCount((count) => Math.max(0, count - 1));
  }, []);

  const { View } = useLottie(
    {
      animationData: runningDogAnimation,
      loop: true,
      autoplay: true,
      onDOMLoaded: () => setReady(true),
    },
    { width: 262, height: 131 },
  );

  const value = useMemo(
    () => ({
      ready,
      show,
      hide,
    }),
    [ready, show, hide],
  );

  const requested = holdCount > 0;
  // Full loading chrome (dog + text) only after Lottie is ready — never text-first.
  const revealContent = requested && ready;

  return (
    <LoadingOverlayContext.Provider value={value}>
      <div
        className={
          requested
            ? 'fixed inset-0 z-50 flex items-center justify-center bg-sop-primary-100 backdrop-blur-sm'
            : 'pointer-events-none fixed top-0 left-0 h-px w-px overflow-hidden opacity-0'
        }
        aria-hidden={!revealContent}
        role={revealContent ? 'status' : undefined}
      >
        <div
          className={`flex flex-col items-center transition-opacity duration-100 ${
            revealContent ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {View}
          <label className="sop-body-lg-medium text-sop-secondary-500 text-center">
            กำลังโหลด ...
          </label>
        </div>
      </div>
      {children}
    </LoadingOverlayContext.Provider>
  );
}

/**
 * Used by `app/loading.tsx`. Reveals the pre-warmed overlay; does not create Lottie.
 */
export function GlobalLoadingStage() {
  const ctx = useContext(LoadingOverlayContext);

  useEffect(() => {
    if (!ctx) return;
    ctx.show();
    return () => ctx.hide();
  }, [ctx]);

  // Outside the provider (tests): keep a solid shell so layout doesn't jump.
  if (!ctx) {
    return <div className="fixed inset-0 z-50 bg-sop-primary-100" aria-hidden />;
  }

  // Provider paints the real overlay; this only holds the Suspense slot.
  return <div className="fixed inset-0 z-40 bg-sop-primary-100" aria-hidden />;
}
