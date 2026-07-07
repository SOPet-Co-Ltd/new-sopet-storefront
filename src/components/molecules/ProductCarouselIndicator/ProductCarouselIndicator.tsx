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
    <div
      className="flex w-full items-center gap-2"
      data-testid="product-gallery-thumbnails"
    >
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous image"
        className={cn(
          'flex size-8 shrink-0 items-center justify-center',
          selectedIndex === 0 ? 'opacity-50 cursor-not-allowed' : '',
        )}
        disabled={selectedIndex === 0}
      >
        <LeftArrowIcon size={{ mobile: 20, desktop: 20 }} strokeWidth={1} color="#949495" />
      </button>

      <div className="min-w-0 flex-1 overflow-hidden" aria-label="Product image thumbnails">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-2">
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
                    'size-20 border-4 object-cover transition-colors duration-300',
                    selectedIndex === index
                      ? 'border-sop-secondary-500'
                      : 'border-transparent',
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
          'flex size-8 shrink-0 items-center justify-center',
          selectedIndex === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : '',
          selectedIndex === 0 ? 'cursor-not-allowed' : '',
        )}  
      >
        <RightArrowIcon size={{ mobile: 20, desktop: 20 }} strokeWidth={1} color="#949495" />
      </button>
    </div>
  );
}
