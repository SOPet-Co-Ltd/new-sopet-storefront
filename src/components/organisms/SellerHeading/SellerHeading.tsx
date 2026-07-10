'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { StoreDetail } from '@/lib/hooks/useStore';

type SellerHeadingProps = {
  store: StoreDetail;
};

function StoreAvatar({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  const [logoError, setLogoError] = useState(false);
  const showImage = logoUrl && !logoError;

  return (
    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-sop-primary-200 bg-sop-primary-100">
      {showImage ? (
        <Image
          src={logoUrl}
          alt={name}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center sop-body-xs-medium text-sop-primary-600">
          {name.charAt(0)}
        </div>
      )}
    </div>
  );
}

export function SellerHeading({ store }: SellerHeadingProps) {
  const [bannerError, setBannerError] = useState(false);
  const showBanner = Boolean(store.bannerUrl) && !bannerError;

  return (
    <div
      className="overflow-hidden rounded-sop-16 border border-sop-primary-200 bg-sop-base-white"
      data-testid="seller-heading"
    >
      {showBanner && store.bannerUrl ? (
        <Image
          src={store.bannerUrl}
          alt={store.name}
          width={1200}
          height={160}
          className="h-32 w-full object-cover md:h-40"
          onError={() => setBannerError(true)}
        />
      ) : null}
      <div className="bg-sop-base-white p-4 md:p-5">
        <div className="flex items-center gap-4">
          <StoreAvatar logoUrl={store.logoUrl} name={store.name} />
          <h1 className="sop-headline-sm-regular md:sop-headline-md-regular truncate text-sop-primary-700">
            {store.name}
          </h1>
        </div>
        {store.description ? (
          <p className="sop-body-md-regular mt-4 whitespace-pre-line text-sop-neutral-gray-300">
            {store.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
