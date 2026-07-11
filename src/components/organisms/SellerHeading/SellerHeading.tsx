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
        'relative shrink-0 overflow-hidden rounded-full border-4 border-sop-base-white bg-sop-primary-100 shadow-[0_8px_24px_rgba(15,23,42,0.12)]',
        'h-20 w-20 md:h-24 md:w-24',
        className,
      )}
      data-testid="seller-heading-logo"
    >
      {showImage && logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          fill
          sizes="96px"
          className="object-cover"
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center sop-headline-sm-medium text-sop-primary-600">
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
      className="overflow-hidden rounded-sop-16 border border-sop-neutral-grayalpha-200 bg-sop-base-white shadow-sm"
      data-testid="seller-heading"
    >
      <div className="relative h-32 w-full md:h-44">
        {showBannerImage && store.bannerUrl ? (
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
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-sop-primary-200 via-sop-primary-50 to-sop-base-white"
            data-testid="seller-heading-banner-fallback"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-sop-neutral-gray-200/25 via-transparent to-transparent"
        />
      </div>

      <div className="relative px-4 pb-5 md:px-6 md:pb-6">
        <div className="-mt-10 flex flex-col gap-3 md:-mt-12 md:flex-row md:items-end md:gap-5">
          <StoreLogo logoUrl={store.logoUrl} name={store.name} />
          <div className="min-w-0 flex-1 md:pb-1">
            <h1 className="sop-headline-sm-medium md:sop-headline-md-medium text-sop-neutral-gray-200">
              {store.name}
            </h1>
            {store.description ? (
              <p className="mt-2 whitespace-pre-line sop-body-sm-regular text-sop-neutral-gray-400 md:mt-1 md:line-clamp-3">
                {store.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
