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
    gallerySlides.length === 0 ? 0 : Math.min(selectedIndex, gallerySlides.length - 1);
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
            className="relative aspect-square w-full max-w-[500px] cursor-pointer overflow-hidden lg:rounded-sop-24px md:rounded-sop-24px rounded-none border-0 bg-transparent p-0"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCloseLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 z-10 w-[36px] h-[36px] flex items-center justify-center rounded-full bg-sop-neutral-gray-300 hover:bg-sop-neutral-gray-400 transition-colors"
            aria-label="Close lightbox"
          >
            <CloseIcon size={{ mobile: 20, desktop: 20 }} color="#f5f5f5" />
          </button>

          {/* Main layout: image + vertical thumbnail strip */}
          <div
            className="flex flex-col md:flex-row items-center gap-sop-24px md:gap-sop-40px px-4 w-full max-w-[700px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image area */}
            <div className="relative flex-1 min-w-0">
              {/* Prev button */}
              {gallerySlides.length > 1 && (
                <button
                  type="button"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-[36px] h-[36px] flex items-center justify-center rounded-full bg-sop-neutral-whitealpha-700 hover:bg-sop-neutral-whitealpha-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  aria-label="Previous image"
                >
                  <LeftArrowIcon size={{ mobile: 10, desktop: 10 }} color="#211f23" />
                </button>
              )}

              {/* Carousel */}
              <div className="overflow-hidden rounded-2xl" ref={lightboxEmblaRef}>
                <div className="flex">
                  {gallerySlides.map((slide) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0">
                      {/* Image */}
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                          src={slide.imageUrl}
                          alt="Product image"
                          width={600}
                          height={600}
                          className="size-full object-cover object-center"
                          draggable={false}
                          sizes="(min-width: 768px) 500px, 80vw"
                        />
                      </div>
                      {/* Trust badges */}
                      <ProductGalleryTrustBadges />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next button */}
              {gallerySlides.length > 1 && (
                <button
                  type="button"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 translate-x-1/2 z-5 w-[36px] h-[36px] flex items-center justify-center rounded-full bg-sop-neutral-whitealpha-700 hover:bg-sop-neutral-whitealpha-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  aria-label="Next image"
                >
                  <RightArrowIcon size={{ mobile: 10, desktop: 10 }} color="#211f23" />
                </button>
              )}
            </div>

            {/* Vertical thumbnail strip (hidden on small screens) */}
            {gallerySlides.length > 1 && (
              <div
                className="flex flex-row md:flex-col justify-center md:justify-start gap-2 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden w-full md:w-auto max-h-[85vh] shrink-0"
                style={{ scrollbarWidth: 'none' }}
              >
                {gallerySlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => lightboxEmblaApi?.scrollTo(index)}
                    aria-label={`เลือกรูปที่ ${index + 1}`}
                    aria-current={lightboxSelectedIndex === index ? 'true' : undefined}
                    className={[
                      'shrink-0 overflow-hidden rounded-xl transition-all duration-200 w-[64px] md:w-[80px]',
                      lightboxSelectedIndex === index
                        ? 'ring-2 ring-sop-primary-500 opacity-100'
                        : 'opacity-60 hover:opacity-90',
                    ].join(' ')}
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      <Image
                        src={slide.imageUrl}
                        alt={`Product thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        className="size-full object-cover object-center"
                        draggable={false}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
