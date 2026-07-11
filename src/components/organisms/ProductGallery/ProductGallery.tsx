'use client';

import { ProductCarousel } from '@/components/organisms/ProductCarousel/ProductCarousel';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductGalleryProps = {
  images: ProductDetail['images'];
  thumbnailUrl?: string | null;
};

export function ProductGallery({ images, thumbnailUrl }: ProductGalleryProps) {
  return (
    <div className="flex flex-col md:px-0">
      <ProductCarousel slides={images ?? undefined} thumbnailUrl={thumbnailUrl} />
    </div>
  );
}
