'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Bag5Icon } from '@/components/atoms/icons/inline/Bag5Icon';
import {
  findVariantByOptions,
  type VariantOptions,
} from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import { trackAddToCart } from '@/lib/analytics';
import { flyToCart, getProductFlyImageUrl } from '@/lib/cart/flyToCart';
import {
  computeSaleUnitPrice,
  pickCampaignItem,
  resolveCompareAtPrice,
} from '@/lib/catalog/resolve-compare-at-price';
import { buildBuyNowCheckoutPayload, setBuyNowCheckout } from '@/lib/checkout/buyNowCheckout';
import { useActiveSaleCampaignItems } from '@/lib/hooks/useActiveSaleCampaignItems';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { useCart } from '@/lib/providers/CartProvider';
import { cn } from '@/lib/utils';

export type ProductFloatingBuyCardProps = {
  product: ProductDetail;
  selectedOptions: VariantOptions;
  productQuantity?: number;
  /** Ref to the element (e.g. main product details) that triggers fade-in once scrolled past */
  triggerRef?: React.RefObject<HTMLElement | null>;
  /** Force visibility for testing or snapshot renders */
  forceVisible?: boolean;
  className?: string;
};

function formatPrice(value: number): string {
  return value.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function ProductFloatingBuyCard({
  product,
  selectedOptions,
  productQuantity = 1,
  triggerRef,
  forceVisible,
  className,
}: ProductFloatingBuyCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const addToCartButtonRef = useRef<HTMLButtonElement>(null);

  const [internalVisible, setInternalVisible] = useState(Boolean(forceVisible));
  const isVisible = forceVisible !== undefined ? forceVisible : internalVisible;
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // Scroll detection / Intersection Observer to fade in when user scrolls past triggerRef
  useEffect(() => {
    if (forceVisible !== undefined) return;

    const checkVisibility = () => {
      if (triggerRef?.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // Fade in when the bottom of the main product article has scrolled near or above top of viewport
        const shouldBeVisible = rect.bottom <= 120;
        setInternalVisible(shouldBeVisible);
      } else {
        // Fallback: fade in after scrolling 400px
        setInternalVisible(window.scrollY > 400);
      }
    };

    if (typeof window === 'undefined') return;

    if (triggerRef?.current && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          // When target is not intersecting and is above the viewport, show the card
          const isAboveViewport = entry.boundingClientRect.bottom <= 120;
          setInternalVisible(!entry.isIntersecting && isAboveViewport);
        },
        {
          rootMargin: '-80px 0px 0px 0px',
          threshold: [0, 0.1, 1],
        },
      );

      observer.observe(triggerRef.current);

      window.addEventListener('scroll', checkVisibility, { passive: true });

      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', checkVisibility);
      };
    }

    // Scroll listener fallback
    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      window.removeEventListener('scroll', checkVisibility);
    };
  }, [triggerRef, forceVisible]);

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

  const hasDiscount = compareAtPrice != null && compareAtPrice > variantPrice;
  const savedAmount = hasDiscount ? compareAtPrice - variantPrice : 0;

  const imageUrl =
    (selectedVariant as { imageUrl?: string | null })?.imageUrl ||
    product.thumbnailUrl ||
    product.images?.[0]?.imageUrl ||
    null;

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
      setBuyNowCheckout(payload);
      router.push('/checkout?mode=buy-now');
    } finally {
      setIsBuyingNow(false);
    }
  };

  return (
    <div
      data-testid="product-floating-buy-card"
      aria-hidden={!isVisible}
      className={cn(
        'w-full max-w-[360px] rounded-3xl border border-[#F0EDF5] bg-sop-base-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none',
        className,
      )}
    >
      {/* Top row: Thumbnail & Price details */}
      <div className="flex items-center gap-3.5">
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-2xl bg-sop-neutral-gray-500 border border-sop-neutral-gray-500/50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="88px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-sop-neutral-gray-400">
              ไม่มีรูป
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {hasAnyPrice ? (
            <>
              <div
                data-testid="floating-variant-price"
                className="text-2xl font-bold tracking-tight text-sop-secondary-500 lg:text-[28px]"
              >
                ฿{formatPrice(variantPrice)}
              </div>

              {hasDiscount && (
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span
                    data-testid="floating-compare-price"
                    className="text-sm font-normal text-sop-neutral-grayalpha-400 line-through lg:text-base"
                  >
                    ฿{formatPrice(compareAtPrice)}
                  </span>
                  <span
                    data-testid="floating-saved-badge"
                    className="inline-flex items-center rounded-full bg-[#FFF0ED] px-2.5 py-0.5 text-xs font-semibold text-sop-secondary-500"
                  >
                    ประหยัด ฿{Math.round(savedAmount).toLocaleString('th-TH')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <span className="text-sm text-sop-neutral-gray-400">Not available</span>
          )}
        </div>
      </div>

      {/* Bottom row: Action Buttons */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        <Button
          ref={addToCartButtonRef}
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={isOutOfStock || !hasAnyPrice}
          loading={isAddingToCart}
          variant="secondary"
          className="h-11 min-w-0 rounded-full border-2 border-sop-secondary-500 bg-sop-base-white !px-2 text-sm font-medium text-sop-secondary-500 hover:bg-sop-secondary-50 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-busy={isAddingToCart}
          aria-label={
            isAddingToCart
              ? 'กำลังเพิ่มสินค้าลงตะกร้า กรุณารอสักครู่'
              : isOutOfStock
                ? 'สินค้าหมด'
                : `เพิ่ม ${product.name} ลงตะกร้า`
          }
        >
          <span className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Bag5Icon size={{ mobile: 20, desktop: 20 }} color="#ff6f61" />
            <span className="whitespace-nowrap">
              {isOutOfStock ? 'สินค้าหมด' : 'เพิ่มใส่ตะกร้า'}
            </span>
          </span>
        </Button>

        <Button
          type="button"
          onClick={() => void handleBuyNow()}
          disabled={isOutOfStock || !hasAnyPrice}
          loading={isBuyingNow}
          variant="primary"
          className="h-11 min-w-0 rounded-full bg-sop-primary-500 !px-2 text-sm font-medium text-white shadow-xs hover:bg-sop-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-busy={isBuyingNow}
          aria-label={
            isBuyingNow
              ? 'กำลังดำเนินการซื้อสินค้า กรุณารอสักครู่'
              : isOutOfStock
                ? 'สินค้าหมด ไม่สามารถสั่งซื้อได้'
                : `ซื้อ ${product.name} เลย`
          }
        >
          <span className="whitespace-nowrap">ซื้อเลย</span>
        </Button>
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isAddingToCart && 'กำลังเพิ่มสินค้าลงตะกร้า'}
        {isBuyingNow && 'กำลังดำเนินการซื้อสินค้า'}
      </div>
    </div>
  );
}
