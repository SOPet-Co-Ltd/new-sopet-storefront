'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ProductReviewStars } from '@/components/molecules/ProductReviewStars/ProductReviewStars';
import ProductDetailsMetaFooter from '@/components/organisms/ProductDetailsMetaFooter/ProductDetailsMetaFooter';
import ProductDetailsVariantSelection from '@/components/organisms/ProductDetailsVariantSelection/ProductDetailsVariantSelection';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsProps = {
  product: ProductDetail;
  onVariantChange?: (
    variantId: string | null,
    price: number,
    stockQuantity: number,
    quantity: number,
  ) => void;
  shareModalOpen?: boolean;
  onShareModalOpenChange?: (open: boolean) => void;
};

export function ProductDetails({
  product,
  onVariantChange,
  shareModalOpen,
  onShareModalOpenChange,
}: ProductDetailsProps) {
  const [internalShareOpen, setInternalShareOpen] = useState(false);
  const isShareOpen = shareModalOpen ?? internalShareOpen;
  const setShareOpen = onShareModalOpenChange ?? setInternalShareOpen;

  return (
    <div className="flex flex-col px-4 md:px-0 gap-4 md:gap-6">
      <p className="md:sop-headline-md-medium sop-body-lg-medium text-sop-neutral-gray-300">
        {product.name}
      </p>

      <ProductReviewStars
        averageRating={product.averageRating}
        totalReviews={product.reviewCount}
        soldCount={product.soldCount}
      />

      <ProductDetailsVariantSelection
        product={product}
        onVariantChange={onVariantChange}
        shareModalOpen={isShareOpen}
        onShareModalOpenChange={setShareOpen}
        onWishlistClick={() => toast.message('ฟีเจอร์รายการโปรดจะเปิดใช้งานเร็วๆ นี้')}
      />

      {product.tags && product.tags.length > 0 && (
        <ProductDetailsMetaFooter tags={product.tags} />
      )}
    </div>
  );
}
