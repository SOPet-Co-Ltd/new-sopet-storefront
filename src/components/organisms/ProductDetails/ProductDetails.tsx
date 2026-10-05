'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ProductReviewStars } from '@/components/molecules/ProductReviewStars/ProductReviewStars';
import { ProductShareWishlistActions } from '@/components/molecules/ProductShareWishlistActions/ProductShareWishlistActions';
import ProductDetailsVariantSelection from '@/components/organisms/ProductDetailsVariantSelection/ProductDetailsVariantSelection';
import { ProductShareModal } from '@/components/organisms/ProductShareModal/ProductShareModal';
import { ProductExpiryDate } from '@/components/sections/ProductExpiryDate/ProductExpiryDate';
import { ProductShowPrice } from '@/components/sections/ProductShowPrice/ProductShowPrice';

import {
  getDefaultVariant,
  resolveSelectedOptionsFromSearchParams,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';

import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsProps = {
  product: ProductDetail;
  /** Raw Next.js `searchParams` so shared links like `?test=test` select on first paint. */
  variantSearchParams?: Record<string, string | string[] | undefined>;
  onVariantChange?: (
    variantId: string | null,
    price: number,
    stockQuantity: number,
    quantity: number,
  ) => void;
  shareModalOpen?: boolean;
  onShareModalOpenChange?: (open: boolean) => void;
};

function toSearchParamsGetter(
  raw: Record<string, string | string[] | undefined> | undefined,
): Pick<URLSearchParams, 'get'> | null {
  if (!raw) return null;

  return {
    get(key: string) {
      const value = raw[key];

      if (typeof value === 'string') {
        return value;
      }

      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
      }

      return null;
    },
  };
}

function readClientSearchParams(): Pick<URLSearchParams, 'get'> | null {
  if (typeof window === 'undefined') return null;

  return new URLSearchParams(window.location.search);
}

export function ProductDetails({
  product,
  variantSearchParams,
  onVariantChange,
  shareModalOpen,
  onShareModalOpenChange,
}: ProductDetailsProps) {
  const router = useRouter();

  const { isAuthenticated } = useAuth();

  const { isFavorite, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();

  const [selectedOptions, setSelectedOptions] = useState<VariantOptions>(() =>
    resolveSelectedOptionsFromSearchParams(
      product.variants,
      toSearchParamsGetter(variantSearchParams) ?? readClientSearchParams(),
    ),
  );

  const [wishlistPending, setWishlistPending] = useState(false);

  const [internalShareOpen, setInternalShareOpen] = useState(false);

  const isShareModalOpen = shareModalOpen ?? internalShareOpen;

  const setShareModalOpen = onShareModalOpenChange ?? setInternalShareOpen;

  const hasAnyPrice = useMemo(() => {
    const defaultVariant = getDefaultVariant(product.variants);

    return (defaultVariant?.price ?? product.basePrice) > 0;
  }, [product.basePrice, product.variants]);

  const isWishlisted = isFavorite(product.id);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login?notice=sessionRequired');
      return;
    }

    try {
      setWishlistPending(true);

      if (isWishlisted) {
        await removeFavorite(product.id);
        toast.success('นำออกจากรายการโปรดแล้ว');
      } else {
        await addFavorite(product.id);
        toast.success('เพิ่มในรายการโปรดแล้ว');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถอัปเดตรายการโปรดได้',
      });
    } finally {
      setWishlistPending(false);
    }
  };

  const handleShareOpen = () => {
    setShareModalOpen(true);
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h1
              id="product-title"
              className="text-lg font-semibold text-sop-neutral-gray-200 lg:text-xl lg:leading-snug"
            >
              {product.name}
            </h1>

            <ProductShareWishlistActions
              productName={product.name}
              onShare={handleShareOpen}
              onWishlist={() => void handleWishlist()}
              isWishlisted={isWishlisted}
              wishlistLoading={wishlistPending || favoritesLoading}
              className="flex shrink-0"
            />
          </div>

          <ProductReviewStars
            averageRating={product.averageRating}
            totalReviews={product.reviewCount}
            soldCount={product.soldCount}
          />
        </div>

        {hasAnyPrice ? (
          <ProductShowPrice product={product} selectedOptions={selectedOptions} />
        ) : null}
      </div>

      <ProductDetailsVariantSelection
        product={product}
        selectedOptions={selectedOptions}
        onSelectedOptionsChange={setSelectedOptions}
        onVariantChange={onVariantChange}
        expiryDate={product.expiryDate}
      />

      <ProductShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={product}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}
