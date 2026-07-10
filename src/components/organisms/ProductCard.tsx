'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { StarIcon } from '@/components/atoms/icons/filled/StarIcon';
import { prefetchProductById } from '@/lib/catalog/prefetchProduct';
import type { ProductListItem } from '@/lib/hooks/useProducts';

export type ProductCardProduct = Pick<
  ProductListItem,
  | 'id'
  | 'name'
  | 'slug'
  | 'basePrice'
  | 'compareAtPrice'
  | 'thumbnailUrl'
  | 'averageRating'
  | 'reviewCount'
  | 'soldCount'
> & {
  storeId?: string;
};

type ProductCardProps = {
  product: ProductCardProduct;
  compact?: boolean;
  className?: string;
  priority?: boolean;
};

function buildProductHref(productId: string): string {
  return `/product/${productId}`;
}

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatSoldCount(count: number): string {
  if (count < 1000) return count.toString();

  const units = ['', 'k', 'm', 'b', 't'];
  const magnitude = Math.floor(Math.log10(count) / 3);
  const scaled = count / 10 ** (magnitude * 3);
  const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);

  return `${formatted}${units[magnitude]}`;
}

function getDiscountPercent(basePrice: number, compareAtPrice: number | null | undefined): number {
  if (compareAtPrice == null || compareAtPrice <= basePrice) return 0;

  return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
}

function ProductCardImage({
  product,
  discountPercent,
  compact,
  priority = false,
}: {
  product: ProductCardProduct;
  discountPercent: number;
  compact: boolean;
  priority?: boolean;
}) {
  const imageContainerClass = compact
    ? 'relative h-[136px] w-[136px] shrink-0 overflow-hidden bg-sop-additionalblue-300'
    : 'relative h-[168px] w-[168px] shrink-0 overflow-hidden bg-sop-additionalblue-300 md:h-sop-224px md:w-sop-224px';

  return (
    <div className={imageContainerClass}>
      {product.thumbnailUrl ? (
        <Image
          fetchPriority={priority ? 'high' : 'auto'}
          src={product.thumbnailUrl}
          alt={product.name}
          fill
          priority={priority}
          quality={85}
          sizes={compact ? '136px' : '(max-width: 768px) 168px, 224px'}
          className="pointer-events-none object-cover object-center select-none"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p className="sop-body-xs-regular px-4 text-center text-sop-base-white md:sop-body-sm-regular">
            ไม่มีรูปภาพ
          </p>
        </div>
      )}

      {discountPercent > 0 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-end py-1 pl-2 pr-1 md:pl-4 md:pr-2">
          <span className="rounded-sop-16px bg-sop-system-error-400 px-2.5 py-0.5 sop-body-sm-medium text-sop-neutral-grayfixed-600">
            -{discountPercent}%
          </span>
        </div>
      )}
    </div>
  );
}

function ProductCardPrice({
  product,
  compact = false,
}: {
  product: ProductCardProduct;
  compact?: boolean;
}) {
  const hasPrice = product.basePrice > 0;

  if (!hasPrice) {
    return (
      <span className="label-md text-secondary pt-2 pb-4">ไม่มีสินค้าในพื้นที่ของคุณ</span>
    );
  }

  return (
    <div className="flex items-baseline gap-1">
      <span
        className={
          compact
            ? 'sop-body-sm-bold text-sop-secondary-500'
            : 'sop-body-lg-bold text-sop-secondary-500'
        }
      >
        {formatPrice(product.basePrice)}
      </span>
      {product.compareAtPrice != null && product.compareAtPrice > product.basePrice && (
        <span
          className={
            compact
              ? 'sop-strike-2xs-regular text-sop-neutral-grayalpha-400'
              : 'sop-strike-sm-regular text-sop-neutral-grayalpha-400'
          }
        >
          {formatPrice(product.compareAtPrice)}
        </span>
      )}
    </div>
  );
}

function ProductCardReviewStars({ product }: { product: ProductCardProduct }) {
  const averageRating = product.averageRating ?? 0;
  const totalReviews = product.reviewCount ?? 0;
  const soldCount = product.soldCount ?? 0;

  return (
    <div className="flex w-full items-center">
      <StarIcon color="#ffb514" size={{ mobile: 16, desktop: 20 }} />
      <p className="min-w-0 flex-1 pl-1 sop-body-xs-regular text-sop-neutral-gray-400 md:sop-body-sm-regular">
        {averageRating} ({totalReviews})
      </p>
      <p className="shrink-0 whitespace-nowrap sop-body-xs-medium text-sop-neutral-gray-400">
        ขายแล้ว {formatSoldCount(soldCount)}
      </p>
    </div>
  );
}

export default function ProductCard({ product, compact = false, className, priority = false }: ProductCardProps) {
  const href = buildProductHref(product.id);
  const discountPercent = getDiscountPercent(product.basePrice, product.compareAtPrice);
  const cardRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          prefetchProductById(product.id);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [product.id]);

  const handlePrefetch = () => {
    prefetchProductById(product.id);
  };

  const cardWidthClass = compact
    ? 'w-[136px] max-w-[136px]'
    : 'w-[168px] max-w-[168px] md:w-sop-224px md:max-w-sop-224px';

  return (
    <Link
      ref={cardRef}
      href={href}
      prefetch
      aria-label={`ดู ${product.name}`}
      title={`ดู ${product.name}`}
      className={['block shrink-0', className].filter(Boolean).join(' ')}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <div
        className={`flex flex-col gap-2 overflow-hidden rounded-sop-16px bg-sop-base-white ${
          compact ? 'pb-4' : 'pb-4 md:rounded-sop-24px md:pb-5'
        } ${cardWidthClass}`}
      >
        <ProductCardImage
          product={product}
          discountPercent={discountPercent}
          compact={compact}
          priority={priority}
        />
        <div className={`flex min-w-0 flex-col ${compact ? 'gap-1 px-2' : 'gap-2 px-2 md:px-3'}`}>
          <p
            className={
              compact
                ? 'line-clamp-2 sop-body-2xs-regular text-sop-neutral-gray-300'
                : 'line-clamp-2 h-10 sop-body-sm-medium text-sop-neutral-gray-300'
            }
          >
            {product.name}
          </p>
          <ProductCardPrice product={product} compact={compact} />
          {!compact && <ProductCardReviewStars product={product} />}
        </div>
      </div>
    </Link>
  );
}

export { buildProductHref };
