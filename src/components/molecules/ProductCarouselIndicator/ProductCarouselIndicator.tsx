'use client';

import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect } from 'react';
import { LeftArrowIcon } from '@/components/atoms/icons/filled/LeftArrowIcon';
import { RightArrowIcon } from '@/components/atoms/icons/filled/RightArrowIcon';
import { cn } from '@/lib/utils';

type CarouselSlide = {
  id: string;
  imageUrl: string;
};

type ProductCarouselIndicatorProps = {
  slides: CarouselSlide[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function ProductCarouselIndicator({
  slides = [],
  selectedIndex,
  onSelectIndex,
  onPrev,
  onNext,
}: ProductCarouselIndicatorProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'x',
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.scrollTo(selectedIndex);
  }, [emblaApi, selectedIndex]);

  return (
    <div className="flex w-full items-center gap-2" data-testid="product-gallery-thumbnails">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous image"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full border border-sop-neutral-grayalpha-200 bg-white transition-colors hover:bg-sop-neutral-gray-500',
          selectedIndex === 0 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        )}
        disabled={selectedIndex === 0}
      >
        <LeftArrowIcon size={{ mobile: 14, desktop: 14 }} strokeWidth={1.5} color="#949495" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden" aria-label="Product image thumbnails">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className="shrink-0 cursor-pointer"
                onClick={() => onSelectIndex(index)}
                aria-label={`เลือกรูปที่ ${index + 1}`}
                aria-current={selectedIndex === index ? 'true' : undefined}
              >
                <Image
                  src={slide.imageUrl}
                  alt={`Product thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className={cn(
                    'size-[72px] rounded-sop-16px object-cover transition-all duration-200 lg:size-20',
                    selectedIndex === index
                      ? 'border-2 border-sop-primary-500 shadow-xs'
                      : 'border-2 border-transparent opacity-80 hover:opacity-100',
                  )}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next image"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full border border-sop-neutral-grayalpha-200 bg-white transition-colors hover:bg-sop-neutral-gray-500',
          selectedIndex === slides.length - 1 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        )}
        disabled={selectedIndex === slides.length - 1}
      >
        <RightArrowIcon size={{ mobile: 14, desktop: 14 }} strokeWidth={1.5} color="#949495" />
      </button>
    </div>
  );
}
