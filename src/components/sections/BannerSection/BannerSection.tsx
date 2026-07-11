'use client';

import { useQuery } from '@apollo/client/react';
import Image from 'next/image';
import Link from 'next/link';
import { PlatformBannersDocument } from '@/lib/graphql/generated/graphql';
import { useBannerCarousel } from './useBannerCarousel';

const isExternalHref = (href: string): boolean => /^https?:\/\//i.test(href);

function BannerSkeleton() {
  return (
    <div
      className="w-full aspect-3/4 bg-sop-neutral-gray-600 animate-pulse md:aspect-auto md:h-[480px]"
      aria-hidden="true"
    />
  );
}

export function BannerSection() {
  const { data, loading, error, refetch } = useQuery(PlatformBannersDocument);

  const banners = (data?.platformBanners ?? [])
    .filter((banner) => banner.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((banner) => ({
      id: banner.id,
      image_url: banner.imageUrl,
      mobile_image_url: banner.mobileImageUrl ?? undefined,
      name: banner.title,
      href: banner.linkUrl ?? undefined,
      order: banner.sortOrder,
    }));

  const {
    loopedBanners,
    currentIndex,
    displayIndex,
    hasLoop,
    isDragging,
    dragOffsetPx,
    isTransitionEnabled,
    goToIndex,
    startDrag,
    moveDrag,
    endDrag,
    handleTransitionEnd,
    preventDragStart,
    preventClickAfterDrag,
  } = useBannerCarousel({ banners });

  if (loading) {
    return (
      <section className="w-full flex flex-col gap-sop-12px" aria-busy="true">
        <BannerSkeleton />
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full px-4 py-2">
        <button
          type="button"
          onClick={() => void refetch()}
          className="sop-body-sm-medium text-sop-primary-500 underline"
        >
          โหลดแบนเนอร์ไม่สำเร็จ — ลองอีกครั้ง
        </button>
      </section>
    );
  }

  const totalBanners = banners.length;

  if (!totalBanners) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-sop-12px">
      <div
        className={`relative w-full overflow-hidden bg-sop-neutral-gray-600 select-none touch-pan-y ${
          hasLoop ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onMouseDown={(event) => startDrag(event.clientX)}
        onMouseMove={(event) => moveDrag(event.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(event) => startDrag(event.touches[0]?.clientX ?? 0)}
        onTouchMove={(event) => moveDrag(event.touches[0]?.clientX ?? 0)}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}
        onDragStart={preventDragStart}
      >
        <div
          className={`flex aspect-3/4 transition-transform ease-in-out md:aspect-auto md:h-[480px] ${
            isDragging || !isTransitionEnabled ? 'duration-0' : 'duration-500'
          }`}
          style={{
            transform: `translateX(calc(-${displayIndex * 100}% + ${dragOffsetPx}px))`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopedBanners.map((banner, index) => {
            const key = `${banner.id}-${index}`;
            const isFirstVisibleBanner = index === (hasLoop ? 1 : 0);
            const hasMobileImage = Boolean(banner.mobile_image_url);
            const slideClassName =
              'relative h-full w-full shrink-0 grow-0 basis-full overflow-hidden';
            const imageClassName = 'h-full w-full object-cover object-center';
            const image = (
              <>
                <Image
                  priority={isFirstVisibleBanner}
                  fetchPriority={isFirstVisibleBanner ? 'high' : 'auto'}
                  src={banner.image_url}
                  alt={banner.name || 'แบนเนอร์'}
                  width={1440}
                  height={480}
                  sizes="100vw"
                  className={`${imageClassName} ${hasMobileImage ? 'hidden md:block' : ''}`}
                />
                {hasMobileImage ? (
                  <Image
                    priority={isFirstVisibleBanner}
                    fetchPriority={isFirstVisibleBanner ? 'high' : 'auto'}
                    src={banner.mobile_image_url as string}
                    alt={banner.name || 'แบนเนอร์'}
                    width={768}
                    height={1024}
                    sizes="100vw"
                    className={`${imageClassName} md:hidden`}
                  />
                ) : null}
              </>
            );

            if (!banner.href) {
              return (
                <div key={key} className={slideClassName} onClickCapture={preventClickAfterDrag}>
                  {image}
                </div>
              );
            }

            if (isExternalHref(banner.href)) {
              return (
                <a
                  key={key}
                  href={banner.href}
                  target="_blank"
                  rel="noreferrer"
                  className={slideClassName}
                  onClickCapture={preventClickAfterDrag}
                >
                  {image}
                </a>
              );
            }

            return (
              <Link
                href={banner.href}
                key={key}
                className={slideClassName}
                onClickCapture={preventClickAfterDrag}
              >
                {image}
              </Link>
            );
          })}
        </div>

        {hasLoop && (
          <div className="absolute right-sop-12px bottom-sop-12px rounded-sop-100px bg-sop-neutral-grayalpha-900 px-sop-12px py-sop-4px">
            <div className="flex items-center justify-center gap-sop-8px">
              {banners.map((banner, index) => {
                const isActive = index + 1 === currentIndex;

                return (
                  <button
                    type="button"
                    key={banner.id}
                    onClick={() => goToIndex(index)}
                    className={`h-sop-8px rounded-sop-100px transition-all ${
                      isActive
                        ? 'w-sop-24px bg-sop-primary-500'
                        : 'w-sop-8px bg-sop-neutral-gray-400'
                    }`}
                    aria-label={`ไปแบนเนอร์ ${index + 1}`}
                    aria-current={isActive ? 'true' : 'false'}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
