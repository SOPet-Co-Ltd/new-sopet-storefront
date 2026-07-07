'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { buildProductHref } from '@/components/organisms/ProductCard';
import type { FavoriteItem } from '@/lib/hooks/useFavorites';

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

type FavoritesGridProps = {
  favorites: FavoriteItem[];
  loading?: boolean;
  onRemove: (productId: string) => void;
  removingId?: string | null;
};

export function FavoritesGrid({
  favorites,
  loading = false,
  onRemove,
  removingId,
}: FavoritesGridProps) {
  if (loading) {
    return <p className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</p>;
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-12 text-center">
        <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยังไม่มีสินค้าในรายการ</p>
        <Link
          href="/products"
          className="mt-4 inline-block sop-body-sm-medium text-sop-secondary-500 underline"
        >
          ไปเลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {favorites.map((item) => {
        const product = item.product;
        if (!product) return null;

        const imageUrl = product.thumbnailUrl ?? product.images?.[0]?.imageUrl;

        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white"
          >
            <Link href={buildProductHref(product.id)} className="block">
              <div className="relative aspect-square bg-sop-neutral-gray-500">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
                    ไม่มีรูป
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 sop-body-sm-regular text-sop-neutral-gray-200">
                  {product.name}
                </p>
                <p className="mt-1 sop-body-sm-medium text-sop-secondary-600">
                  {formatPrice(product.basePrice)}
                </p>
              </div>
            </Link>
            <div className="px-3 pb-3">
              <Button
                variant="outline"
                size="sm"
                fill
                loading={removingId === item.productId}
                disabled={removingId === item.productId}
                onClick={() => onRemove(item.productId)}
              >
                ลบออก
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
