'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { LatestPurchaseProductsDocument } from '@/lib/graphql/generated/graphql';
import { useAuth } from '@/lib/hooks/useAuth';
import ProductCard, { type ProductCardProduct } from '@/components/organisms/ProductCard';
import { CaretLeftIcon, CaretRightIcon } from '@/components/atoms/icons/inline';
import { cn } from '@/lib/utils';

const RECENT_ORDERS_LIMIT = 12;
const SECTION_HEADING_CLASS = 'sop-body-lg-medium text-sop-neutral-gray-200';
const RECENT_ORDERS_SCROLL_CLASS =
  'w-full overflow-x-auto overscroll-x-contain touch-pan-x scroll-smooth [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden';

type ScrollState = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
};

function useHorizontalScrollState(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setScrollState({
      canScrollLeft: scrollLeft > 1,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    updateScrollState();

    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.addEventListener('scroll', updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, itemCount]);

  const scrollByPage = useCallback((direction: 'left' | 'right') => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const delta = element.clientWidth * 0.8 * (direction === 'left' ? -1 : 1);
    element.scrollBy({ left: delta, behavior: 'smooth' });
  }, []);

  return { scrollRef, scrollState, scrollByPage };
}

function ScrollFade({ side, visible }: { side: 'left' | 'right'; visible: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 z-10 w-8 transition-opacity duration-200',
        side === 'left'
          ? 'left-0 bg-linear-to-r from-sop-base-white to-transparent'
          : 'right-0 bg-linear-to-l from-sop-base-white to-transparent',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}

function RecentOrdersScrollButton({
  direction,
  visible,
  onClick,
}: {
  direction: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 'left' ? CaretLeftIcon : CaretRightIcon;
  const label = direction === 'left' ? 'เลื่อนไปทางซ้าย' : 'เลื่อนไปทางขวา';

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-sop-neutral-grayalpha-200 bg-sop-base-white shadow-md transition-opacity md:flex',
        direction === 'left' ? 'left-0' : 'right-0',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <Icon size={{ mobile: 16, desktop: 16 }} />
    </button>
  );
}

function RecentOrdersSkeleton() {
  return (
    <div className="flex min-w-max gap-5 pb-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-[216px] w-[136px] shrink-0 rounded-sop-16px bg-sop-neutral-gray-600 animate-pulse"
        />
      ))}
    </div>
  );
}

function RecentOrdersProductList({ products }: { products: ProductCardProduct[] }) {
  const { scrollRef, scrollState, scrollByPage } = useHorizontalScrollState(products.length);

  return (
    <div className="relative">
      <ScrollFade side="left" visible={scrollState.canScrollLeft} />
      <ScrollFade side="right" visible={scrollState.canScrollRight} />
      <RecentOrdersScrollButton
        direction="left"
        visible={scrollState.canScrollLeft}
        onClick={() => scrollByPage('left')}
      />
      <RecentOrdersScrollButton
        direction="right"
        visible={scrollState.canScrollRight}
        onClick={() => scrollByPage('right')}
      />
      <div ref={scrollRef} className={RECENT_ORDERS_SCROLL_CLASS}>
        <ul className="flex min-w-max gap-5 pb-2">
          {products.map((product) => (
            <li key={product.id} className="w-[136px] shrink-0">
              <ProductCard product={product} compact />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type HomeRecentOrdersSectionProps = {
  viewAllHref?: string;
};

export function HomeRecentOrdersSection({
  viewAllHref = '/user/orders',
}: HomeRecentOrdersSectionProps) {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery(LatestPurchaseProductsDocument, {
    variables: { limit: RECENT_ORDERS_LIMIT },
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <section className="w-full" aria-busy="true" data-testid="home-recent-orders">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className={SECTION_HEADING_CLASS}>ซื้อล่าสุด</h2>
        </div>
        <div className={RECENT_ORDERS_SCROLL_CLASS}>
          <RecentOrdersSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return null;
  }

  const recentProducts = data?.latestPurchaseProducts ?? [];

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="w-full" data-testid="home-recent-orders">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className={SECTION_HEADING_CLASS}>ซื้อล่าสุด</h2>
        <Link
          href={viewAllHref}
          className="shrink-0 sop-link-md-regular text-sop-neutral-gray-300 underline"
        >
          ดูทั้งหมด
        </Link>
      </div>
      <RecentOrdersProductList products={recentProducts} />
    </section>
  );
}
