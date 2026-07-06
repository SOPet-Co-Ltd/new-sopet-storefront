'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsSellerProps = {
  store: ProductDetail['store'];
};

export default function ProductDetailsSeller({ store }: ProductDetailsSellerProps) {
  if (!store) return null;

  return (
    <div
      className="md:mt-5 mt-2 bg-sop-base-white px-4 py-5 md:rounded-lg rounded-none"
      data-testid="product-seller"
    >
      <div className="flex items-center justify-between gap-4">
        <Link href={`/sellers/${store.slug}`} className="flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-500">
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
                {store.name.charAt(0)}
              </div>
            )}
          </div>
          <p className="md:sop-headline-sm-regular sop-body-sm-regular text-sop-neutral-gray-300">
            {store.name}
          </p>
        </Link>
        <Link
          href={`/sellers/${store.slug}`}
          className="sop-body-xs-regular md:sop-body-md-regular py-1 md:px-8 px-4 border rounded-full border-sop-secondary-500 text-sop-secondary-500"
        >
          ดูร้านค้า
        </Link>
      </div>
    </div>
  );
}
