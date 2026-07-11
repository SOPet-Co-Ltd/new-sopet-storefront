'use client';

import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/atoms/Modal';
import { PlatformAdsDocument } from '@/lib/graphql/generated/graphql';

export const ADS_DISMISS_STORAGE_KEY = 'sopet:storefront:promo-ads:dismiss-state';
const DEFAULT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const DEFAULT_ADS_IMAGE_ALT = 'Sopet promotional advertisement';

type AdsDismissState = {
  dismissedAt: number;
  expiresAt: number;
};

export const getCooldownMs = () => {
  const raw = process.env.NEXT_PUBLIC_PROMO_ADS_MODAL_COOLDOWN_MS;
  const parsed = Number(raw);

  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  return DEFAULT_COOLDOWN_MS;
};

export const parseDismissState = (value: string | null): AdsDismissState | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<AdsDismissState> | null;
    if (!parsed || typeof parsed.dismissedAt !== 'number' || typeof parsed.expiresAt !== 'number') {
      return null;
    }

    return {
      dismissedAt: parsed.dismissedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
};

export function PromotionalAdsModal() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldFetchAds, setShouldFetchAds] = useState(false);
  const cooldownMs = useMemo(getCooldownMs, []);

  const { data, loading, error } = useQuery(PlatformAdsDocument, {
    skip: !shouldFetchAds,
  });

  const ad = data?.platformAds[0];

  useEffect(() => {
    const now = Date.now();
    const storedValue = localStorage.getItem(ADS_DISMISS_STORAGE_KEY);
    const dismissState = parseDismissState(storedValue);

    if (dismissState && dismissState.expiresAt > now) {
      setIsOpen(false);
      setShouldFetchAds(false);
      setIsHydrated(true);
      return;
    }

    if (dismissState && dismissState.expiresAt <= now) {
      localStorage.removeItem(ADS_DISMISS_STORAGE_KEY);
    }

    setIsOpen(true);
    setShouldFetchAds(true);
    setIsHydrated(true);
  }, []);

  const handleDismiss = useCallback(() => {
    const dismissedAt = Date.now();
    const expiresAt = dismissedAt + cooldownMs;

    const payload: AdsDismissState = {
      dismissedAt,
      expiresAt,
    };

    localStorage.setItem(ADS_DISMISS_STORAGE_KEY, JSON.stringify(payload));
    setIsOpen(false);
    setShouldFetchAds(false);
  }, [cooldownMs]);

  if (!isHydrated || !isOpen || loading || error || !ad) {
    return null;
  }

  const imageAlt = ad.title.trim() || DEFAULT_ADS_IMAGE_ALT;

  return (
    <Modal
      onClose={handleDismiss}
      transparentBackground
      insideCloseButton
      width={420}
      className="overflow-visible border-0 bg-transparent p-0 shadow-none"
      contentClassName="px-0 overflow-visible"
      overlayClassName="bg-sop-neutral-whitealpha-400 backdrop-blur-sm"
      aria-label="Promotional advertisement"
    >
      <div className="relative p-0">
        <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-xl sm:max-w-[420px]">
          <div className="relative aspect-4/5">
            <Image
              src={ad.imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 640px) 90vw, 420px"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
