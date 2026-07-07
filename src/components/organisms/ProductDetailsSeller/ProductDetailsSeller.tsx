'use client';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsSellerProps = {
  store: ProductDetail['store'];
};

export default function ProductDetailsSeller({ store }: ProductDetailsSellerProps) {
  if (!store) return null;

  const handleFollow = () => {
    toast.message('ฟีเจอร์ติดตามร้านค้าจะเปิดใช้งานเร็วๆ นี้');
  };

  return (
    <div
      className="md:mt-5 mt-2 bg-sop-base-white px-4 py-5 md:rounded-sop-16px rounded-none"
      data-testid="product-seller"
    >
      <div className="flex items-center justify-between gap-4">
        <Link href={`/sellers/${store.slug}`} className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-500">
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
          <p className="md:sop-headline-sm-regular sop-body-sm-regular text-sop-neutral-gray-300 truncate">
            {store.name}
          </p>
        </Link>
        <button
          type="button"
          onClick={handleFollow}
          className="shrink-0 sop-body-xs-regular md:sop-body-md-regular py-1.5 md:px-8 px-5 border rounded-full border-sop-primary-500 text-sop-primary-500 cursor-pointer"
          data-testid="seller-follow-button"
        >
          ติดตาม
        </button>
      </div>
    </div>
  );
}
