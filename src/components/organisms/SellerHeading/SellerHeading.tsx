'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { StoreDetail } from '@/lib/hooks/useStore';

type SellerHeadingProps = {
  store: StoreDetail;
};

function getStoreInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'S';
}

function StoreLogo({
  logoUrl,
  name,
  className,
}: {
  logoUrl: string | null;
  name: string;
  className?: string;
}) {
  const [logoError, setLogoError] = useState(false);
  const showImage = Boolean(logoUrl) && !logoError;

  return (
    <div
      className={cn(
        'relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-500',
        className,
      )}
      data-testid="seller-heading-logo"
    >
      {showImage && logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes="48px"
          className="object-cover"
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
          {getStoreInitial(name)}
        </div>
      )}
    </div>
  );
}

export function SellerHeading({ store }: SellerHeadingProps) {
  const [bannerError, setBannerError] = useState(false);
  const showBannerImage = Boolean(store.bannerUrl) && !bannerError;

  return (
    <div
      className="overflow-hidden rounded-sop-16 border border-sop-neutral-grayalpha-200 bg-sop-base-white"
      data-testid="seller-heading"
    >
      {showBannerImage && store.bannerUrl ? (
        <div className="relative h-32 w-full md:h-40">
          <Image
            src={store.bannerUrl}
            alt={`แบนเนอร์ ${store.name}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
            data-testid="seller-heading-banner"
            onError={() => setBannerError(true)}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <StoreLogo logoUrl={store.logoUrl} name={store.name} />
          <h1 className="min-w-0 truncate sop-headline-sm-regular md:sop-headline-md-regular text-sop-neutral-gray-300">
            {store.name}
          </h1>
        </div>
        {store.description ? (
          <p className="whitespace-pre-line sop-body-md-regular text-sop-neutral-gray-300">
            {store.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
