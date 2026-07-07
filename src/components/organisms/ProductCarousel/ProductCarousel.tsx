'use client';

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { CloseIcon } from '@/components/atoms/icons/filled/CloseIcon';
import { LeftArrowIcon } from '@/components/atoms/icons/filled/LeftArrowIcon';
import { RightArrowIcon } from '@/components/atoms/icons/filled/RightArrowIcon';
import { ProductCarouselIndicator } from '@/components/molecules/ProductCarouselIndicator/ProductCarouselIndicator';
import { ProductGalleryTrustBadges } from '@/components/molecules/ProductGalleryTrustBadges/ProductGalleryTrustBadges';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductImage = NonNullable<ProductDetail['images']>[number];

type ProductCarouselProps = {
  slides?: ProductImage[];
  thumbnailUrl?: string | null;
};

function resolveSlides(
  slides: ProductImage[] | undefined,
  thumbnailUrl?: string | null,
): ProductImage[] {
  if (slides && slides.length > 0) {
    return [...slides].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  if (thumbnailUrl) {
    return [
      {
        id: 'thumbnail',
        imageUrl: thumbnailUrl,
        isThumbnail: true,
        sortOrder: 0,
      },
    ];
  }

  return [];
}

export function ProductCarousel({ slides = [], thumbnailUrl }: ProductCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  const [lightboxEmblaRef, lightboxEmblaApi] = useEmblaCarousel({
    axis: 'x',
    loop: true,
    align: 'start',
    startIndex: lightboxStartIndex,
  });

  const [lightboxSelectedIndex, setLightboxSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const gallerySlides = resolveSlides(slides, thumbnailUrl);
  const activeIndex =
    gallerySlides.length === 0
      ? 0
      : Math.min(selectedIndex, gallerySlides.length - 1);
  const currentSlide = gallerySlides[activeIndex];

  useEffect(() => {
    if (!lightboxEmblaApi) return;

    const onSelect = () => {
      setLightboxSelectedIndex(lightboxEmblaApi.selectedScrollSnap());
      setCanScrollPrev(lightboxEmblaApi.canScrollPrev());
      setCanScrollNext(lightboxEmblaApi.canScrollNext());
    };

    lightboxEmblaApi.on('select', onSelect);
    onSelect();

    return () => {
      lightboxEmblaApi.off('select', onSelect);
    };
  }, [lightboxEmblaApi]);

  useEffect(() => {
    if (isLightboxOpen && lightboxEmblaApi) {
      lightboxEmblaApi.scrollTo(lightboxStartIndex);
    }
  }, [isLightboxOpen, lightboxEmblaApi, lightboxStartIndex]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((index) => (index - 1 + gallerySlides.length) % gallerySlides.length);
  }, [gallerySlides.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((index) => (index + 1) % gallerySlides.length);
  }, [gallerySlides.length]);

  const handleImageClick = (index: number) => {
    setLightboxStartIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  const scrollPrev = useCallback(() => {
    lightboxEmblaApi?.scrollPrev();
  }, [lightboxEmblaApi]);

  const scrollNext = useCallback(() => {
    lightboxEmblaApi?.scrollNext();
  }, [lightboxEmblaApi]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseLightbox();
      } else if (event.key === 'ArrowLeft') {
        scrollPrev();
      } else if (event.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, scrollNext, scrollPrev]);

  if (gallerySlides.length === 0) {
    return (
      <div
        className="relative w-full aspect-square flex items-center justify-center bg-sop-additionalblue-300 rounded-sop-16px"
        data-testid="product-gallery-empty"
      >
        <p className="sop-body-sm-regular text-sop-base-white">ไม่มีรูปภาพ</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mx-auto w-full max-w-[500px]" data-testid="product-gallery">
        <div className="flex flex-col items-center gap-[18px]">
          <button
            type="button"
            className="relative aspect-square w-full max-h-[500px] max-w-[500px] cursor-pointer overflow-hidden border-0 bg-transparent p-0"
            onClick={() => handleImageClick(activeIndex)}
            aria-label="ดูรูปภาพขนาดใหญ่"
            data-testid="product-gallery-hero"
          >
            <Image
              priority
              src={currentSlide.imageUrl}
              alt="Product image"
              width={500}
              height={500}
              sizes="(min-width: 1024px) 500px, 100vw"
              className="size-full object-cover object-center select-none"
              draggable={false}
            />
          </button>
          <ProductCarouselIndicator
            slides={gallerySlides}
            selectedIndex={activeIndex}
            onSelectIndex={setSelectedIndex}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sop-neutral-grayalpha-500 backdrop-blur-sm">
          <button
            type="button"
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 z-10 w-[30px] h-[30px] flex items-center justify-center rounded-full bg-sop-neutral-gray-300 hover:bg-sop-neutral-gray-400 transition-colors"
            aria-label="Close lightbox"
          >
            <CloseIcon size={{ mobile: 20, desktop: 20 }} color="#f5f5f5" />
          </button>

          {gallerySlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="absolute left-4 z-10 w-[30px] h-[30px] flex items-center justify-center rounded-full bg-sop-neutral-whitealpha-700 hover:bg-sop-neutral-whitealpha-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous image"
              >
                <LeftArrowIcon size={{ mobile: 8, desktop: 8 }} color="#211f23" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="absolute right-4 z-10 w-[30px] h-[30px] flex items-center justify-center rounded-full bg-sop-neutral-whitealpha-700 hover:bg-sop-neutral-whitealpha-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next image"
              >
                <RightArrowIcon size={{ mobile: 8, desktop: 8 }} color="#211f23" />
              </button>
            </>
          )}

          <div
            className="w-full h-full flex items-center justify-center px-4 md:px-8 lg:px-16"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div
              className="overflow-hidden w-full h-full max-w-[85vw] max-h-[85vh]"
              ref={lightboxEmblaRef}
            >
              <div className="flex h-full">
                {gallerySlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="flex-[0_0_100%] min-w-0 flex items-center justify-center h-full"
                  >
                    <Image
                      src={slide.imageUrl}
                      alt="Product image"
                      width={2000}
                      height={2000}
                      className="w-full h-full max-w-full max-h-full object-contain"
                      draggable={false}
                      sizes="100vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {gallerySlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sop-body-sm-regular text-sop-base-white">
              {lightboxSelectedIndex + 1}/{gallerySlides.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
