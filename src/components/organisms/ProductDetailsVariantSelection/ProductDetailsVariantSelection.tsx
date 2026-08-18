'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { ProductDetailQuantitySelection } from '@/components/molecules/ProductDetailQuantitySelection/ProductDetailQuantitySelection';
import { ProductShareWishlistActions } from '@/components/molecules/ProductShareWishlistActions/ProductShareWishlistActions';
import { ProductVariants } from '@/components/molecules/ProductVariants/ProductVariants';
import { ProductShareModal } from '@/components/organisms/ProductShareModal/ProductShareModal';
import { trackAddToCart } from '@/lib/analytics';
import { flyToCart, getProductFlyImageUrl } from '@/lib/cart/flyToCart';
import { buildBuyNowCheckoutPayload, setBuyNowCheckout } from '@/lib/checkout/buyNowCheckout';
import {
  computeSaleUnitPrice,
  pickCampaignItem,
  resolveCompareAtPrice,
} from '@/lib/catalog/resolve-compare-at-price';
import { useActiveSaleCampaignItems } from '@/lib/hooks/useActiveSaleCampaignItems';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { useCart } from '@/lib/providers/CartProvider';
import { findVariantByOptions, type VariantOptions } from './variantUtils';

export type ProductDetailsVariantSelectionProps = {
  product: ProductDetail;
  selectedOptions: VariantOptions;
  onSelectedOptionsChange: (options: VariantOptions) => void;
  onVariantChange?: (
    variantId: string | null,
    price: number,
    stockQuantity: number,
    quantity: number,
  ) => void;
  shareModalOpen?: boolean;
  onShareModalOpenChange?: (open: boolean) => void;
};

export default function ProductDetailsVariantSelection({
  product,
  selectedOptions,
  onSelectedOptionsChange,
  onVariantChange,
  shareModalOpen,
  onShareModalOpenChange,
}: ProductDetailsVariantSelectionProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();
  const [wishlistPending, setWishlistPending] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [internalShareOpen, setInternalShareOpen] = useState(false);
  const isShareModalOpen = shareModalOpen ?? internalShareOpen;
  const setShareModalOpen = onShareModalOpenChange ?? setInternalShareOpen;
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  const selectedVariant = useMemo(
    () => findVariantByOptions(product.variants, selectedOptions),
    [product.variants, selectedOptions],
  );

  const { items: campaignItems } = useActiveSaleCampaignItems(product.storeId);
  const campaignItem = pickCampaignItem(campaignItems, product.id, selectedVariant?.id ?? null);

  const variantId = selectedVariant?.id ?? null;
  const variantStock = selectedVariant?.stockQuantity ?? 0;
  const catalogPrice = selectedVariant?.price ?? product.basePrice;
  const variantPrice =
    computeSaleUnitPrice(catalogPrice, campaignItem?.discountPercent) ?? catalogPrice;
  const compareAtPrice = resolveCompareAtPrice({
    sellPrice: catalogPrice,
    campaignItem,
    variantCompareAt: selectedVariant?.compareAtPrice ?? null,
    productCompareAt: product.compareAtPrice ?? null,
  });
  const hasAnyPrice = variantPrice > 0;
  const isOutOfStock = variantStock <= 0;

  const safeQuantity = Math.min(Math.max(productQuantity, 1), Math.max(variantStock, 1));

  const findVariantStock = (candidateOptions: VariantOptions) =>
    findVariantByOptions(product.variants, candidateOptions)?.stockQuantity ?? 0;

  useEffect(() => {
    onVariantChange?.(variantId, variantPrice, variantStock, safeQuantity);
  }, [onVariantChange, safeQuantity, variantId, variantPrice, variantStock]);

  const syncOptionsToUrl = (nextOptions: VariantOptions) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    Object.keys(nextOptions).forEach((key) => {
      params.delete(key);
      const value = nextOptions[key];
      if (value) {
        params.set(key, value);
      }
    });

    const newSearch = params.toString();
    const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;
    window.history.replaceState(null, '', newUrl);
  };

  const handleOptionChange = (optionKey: string, value: string) => {
    setProductQuantity(1);
    onSelectedOptionsChange({ ...selectedOptions, [optionKey]: value });
    syncOptionsToUrl({ ...selectedOptions, [optionKey]: value });
  };

  const pushAddToCartEvent = () => {
    if (!variantId) return;
    trackAddToCart({
      value: variantPrice * safeQuantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_brand: product.store?.name ?? undefined,
          item_category: product.category ?? undefined,
          item_variant: variantId,
          price: variantPrice,
          quantity: safeQuantity,
        },
      ],
    });
  };

  const handleAddToCart = async () => {
    if (!variantId || isOutOfStock || !hasAnyPrice) return;

    const source = addToCartButtonRef.current;
    if (source) {
      flyToCart({
        source,
        imageUrl: getProductFlyImageUrl(product),
      });
    }

    try {
      setIsAddingToCart(true);
      await addItem(variantId, safeQuantity);
      pushAddToCartEvent();
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!variantId || isOutOfStock || !hasAnyPrice || safeQuantity < 1) return;

    const payload = buildBuyNowCheckoutPayload({
      product,
      variantId,
      quantity: safeQuantity,
      price: variantPrice,
      compareAtPrice,
    });
    if (!payload) return;

    try {
      setIsBuyingNow(true);
      // Buy now is checkout-only: do not merge into the customer cart.
      setBuyNowCheckout(payload);
      router.push('/checkout?mode=buy-now');
    } finally {
      setIsBuyingNow(false);
    }
  };

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
      toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถอัปเดตรายการโปรดได้' });
    } finally {
      setWishlistPending(false);
    }
  };

  const handleShareOpen = () => {
    setShareModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8" data-testid="product-variant-selection">
      {hasAnyPrice && (
        <ProductVariants
          product={product}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
          findVariantStock={findVariantStock}
        />
      )}

      <ProductDetailQuantitySelection
        variantStock={variantStock}
        productQuantity={safeQuantity}
        setProductQuantity={setProductQuantity}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-nowrap items-center gap-2 lg:gap-[18px]">
          <Button
            ref={addToCartButtonRef}
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={isOutOfStock || !hasAnyPrice}
            loading={isAddingToCart}
            size="xl"
            variant="secondary"
            className="h-12 min-w-0 flex-1 border-sop-secondary-500 bg-sop-secondary-100 text-sop-secondary-500"
            aria-busy={isAddingToCart}
            aria-label={
              isAddingToCart
                ? 'กำลังเพิ่มสินค้าลงตะกร้า กรุณารอสักครู่'
                : isOutOfStock
                  ? 'สินค้าหมด'
                  : `เพิ่ม ${product.name} ลงตะกร้า`
            }
          >
            {!hasAnyPrice
              ? 'NOT AVAILABLE IN YOUR REGION'
              : isOutOfStock
                ? 'สินค้าหมด'
                : 'เพิ่มใส่ตะกร้า'}
          </Button>

          <Button
            type="button"
            onClick={() => void handleBuyNow()}
            disabled={isOutOfStock || !hasAnyPrice}
            loading={isBuyingNow}
            size="xl"
            variant="primary"
            className="h-12 min-w-0 flex-1"
            aria-busy={isBuyingNow}
            aria-label={
              isBuyingNow
                ? 'กำลังดำเนินการซื้อสินค้า กรุณารอสักครู่'
                : isOutOfStock
                  ? 'สินค้าหมด'
                  : `ซื้อ ${product.name} เลย`
            }
          >
            ซื้อสินค้า
          </Button>

          <ProductShareWishlistActions
            productName={product.name}
            onShare={handleShareOpen}
            onWishlist={() => void handleWishlist()}
            isWishlisted={isWishlisted}
            wishlistLoading={wishlistPending || favoritesLoading}
            className="shrink-0"
          />
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isAddingToCart && 'กำลังเพิ่มสินค้าลงตะกร้า'}
          {isBuyingNow && 'กำลังดำเนินการซื้อสินค้า'}
        </div>
      </div>

      <ProductShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={product}
        selectedOptions={selectedOptions}
      />
    </div>
  );
}
