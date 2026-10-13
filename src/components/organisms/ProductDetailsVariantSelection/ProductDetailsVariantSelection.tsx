'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { HeartFillIcon } from '@/components/atoms/icons/filled/HeartFillIcon';
import { HeartIcon } from '@/components/atoms/icons/filled/HeartIcon';
import { Bag5Icon } from '@/components/atoms/icons/inline/Bag5Icon';
import { ShareArrowIcon } from '@/components/atoms/icons/outline/ShareArrowIcon';
import { ProductDetailQuantitySelection } from '@/components/molecules/ProductDetailQuantitySelection/ProductDetailQuantitySelection';
import { ProductVariants } from '@/components/molecules/ProductVariants/ProductVariants';

import { trackAddToCart } from '@/lib/analytics';
import { flyToCart, getProductFlyImageUrl } from '@/lib/cart/flyToCart';
import { buildBuyNowCheckoutPayload, setBuyNowCheckout } from '@/lib/checkout/buyNowCheckout';
import {
  computeSaleUnitPrice,
  pickCampaignItem,
  resolveCompareAtPrice,
} from '@/lib/catalog/resolve-compare-at-price';
import { useActiveSaleCampaignItems } from '@/lib/hooks/useActiveSaleCampaignItems';
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
  expiryDate?: string | null;
  onShare?: () => void;
  onWishlist?: () => void;
  isWishlisted?: boolean;
  wishlistLoading?: boolean;
};

export default function ProductDetailsVariantSelection({
  product,
  selectedOptions,
  onSelectedOptionsChange,
  onVariantChange,
  expiryDate,
  onShare,
  onWishlist,
  isWishlisted = false,
  wishlistLoading = false,
}: ProductDetailsVariantSelectionProps) {
  const router = useRouter();

  const { addItem } = useCart();

  const [productQuantity, setProductQuantity] = useState(1);
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

    const nextOptions = {
      ...selectedOptions,
      [optionKey]: value,
    };

    onSelectedOptionsChange(nextOptions);

    syncOptionsToUrl(nextOptions);
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
    if (!variantId || isOutOfStock || !hasAnyPrice) {
      return;
    }

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
    if (!variantId || isOutOfStock || !hasAnyPrice || safeQuantity < 1) {
      return;
    }

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

      // Buy now is checkout-only:
      // do not merge into the customer cart.
      setBuyNowCheckout(payload);

      router.push('/checkout?mode=buy-now');
    } finally {
      setIsBuyingNow(false);
    }
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
        expiryDate={expiryDate ?? product.expiryDate}
      />

      <div className="flex flex-col gap-3">
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 rounded-t-[24px] bg-white px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] lg:static lg:z-auto lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:flex-nowrap lg:gap-3">
          <Button
            ref={addToCartButtonRef}
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={isOutOfStock || !hasAnyPrice}
            loading={isAddingToCart}
            size="xl"
            variant="secondary"
            className="flex h-11 w-11 flex-shrink-0 !p-0 items-center justify-center rounded-full border border-sop-secondary-500 bg-white text-sop-secondary-500 hover:bg-sop-secondary-50 lg:h-12 lg:w-auto lg:min-w-0 lg:flex-1 lg:border-2 lg:bg-sop-base-white lg:px-4 lg:font-medium lg:text-sm lg:hover:bg-sop-secondary-100"
            aria-busy={isAddingToCart}
            aria-label={
              isAddingToCart
                ? 'กำลังเพิ่มสินค้าลงตะกร้า กรุณารอสักครู่'
                : isOutOfStock
                  ? 'สินค้าหมด'
                  : `เพิ่ม ${product.name} ลงตะกร้า`
            }
          >
            <span className="inline-flex items-center justify-center gap-1.5 lg:gap-2">
              <span className="inline-flex items-center justify-center">
                <Bag5Icon size={{ mobile: 24, desktop: 20 }} color="#ff6f61" />
              </span>
              <span className="hidden lg:inline">
                {!hasAnyPrice
                  ? 'NOT AVAILABLE IN YOUR REGION'
                  : isOutOfStock
                    ? 'สินค้าหมด'
                    : 'เพิ่มใส่ตะกร้า'}
              </span>
            </span>
          </Button>

          <Button
            type="button"
            onClick={() => void handleBuyNow()}
            disabled={isOutOfStock || !hasAnyPrice}
            loading={isBuyingNow}
            size="xl"
            variant="primary"
            className="h-11 min-w-0 flex-1 rounded-full bg-sop-primary-500 font-medium text-sm text-white shadow-xs hover:bg-sop-primary-600 lg:h-12 lg:text-sm"
            aria-busy={isBuyingNow}
            aria-label={
              isBuyingNow
                ? 'กำลังดำเนินการซื้อสินค้า กรุณารอสักครู่'
                : isOutOfStock
                  ? 'สินค้าหมด'
                  : `ซื้อ ${product.name} เลย`
            }
          >
            ซื้อเลย
          </Button>
        </div>

        {/* On mobile: Share & Wishlist buttons in the action row */}
        <div className="flex items-center gap-2 lg:hidden">
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-sop-neutral-grayalpha-200 text-sop-neutral-gray-300 transition-colors hover:bg-sop-neutral-gray-500"
              aria-label={`แชร์ ${product.name}`}
            >
              <ShareArrowIcon size={{ mobile: 20, desktop: 20 }} color="#454547" />
            </button>
          )}
          {onWishlist && (
            <button
              type="button"
              onClick={onWishlist}
              disabled={wishlistLoading}
              aria-pressed={isWishlisted}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-sop-neutral-grayalpha-200 transition-colors hover:bg-sop-neutral-gray-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={
                isWishlisted
                  ? `นำ ${product.name} ออกจากรายการโปรด`
                  : `เพิ่ม ${product.name} ในรายการโปรด`
              }
            >
              {isWishlisted ? (
                <HeartFillIcon size={{ mobile: 20, desktop: 20 }} color="#ff6f61" />
              ) : (
                <HeartIcon size={{ mobile: 20, desktop: 20 }} color="#ff6f61" />
              )}
            </button>
          )}
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isAddingToCart && 'กำลังเพิ่มสินค้าลงตะกร้า'}

          {isBuyingNow && 'กำลังดำเนินการซื้อสินค้า'}
        </div>
      </div>
    </div>
  );
}
