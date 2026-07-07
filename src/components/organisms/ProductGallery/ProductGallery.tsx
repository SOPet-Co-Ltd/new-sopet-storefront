'use client';

import { ProductGalleryTrustBadges } from '@/components/molecules/ProductGalleryTrustBadges/ProductGalleryTrustBadges';
import { ProductShareWishlistActions } from '@/components/molecules/ProductShareWishlistActions/ProductShareWishlistActions';
import { ProductCarousel } from '@/components/organisms/ProductCarousel/ProductCarousel';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductGalleryProps = {
  images: ProductDetail['images'];
  thumbnailUrl?: string | null;
  productName?: string;
  onShareClick?: () => void;
  onWishlistClick?: () => void;
};

export function ProductGallery({
  images,
  thumbnailUrl,
  productName = '',
  onShareClick,
  onWishlistClick,
}: ProductGalleryProps) {
  return (
    <div className="md:px-0">
      <ProductCarousel slides={images ?? undefined} thumbnailUrl={thumbnailUrl} />
      <ProductGalleryTrustBadges />
      {onShareClick && onWishlistClick && productName && (
        <ProductShareWishlistActions
          productName={productName}
          onShare={onShareClick}
          onWishlist={onWishlistClick}
          className="mt-3 hidden md:flex px-0"
        />
      )}
    </div>
  );
}
