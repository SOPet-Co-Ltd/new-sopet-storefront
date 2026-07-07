'use client';

import Image from 'next/image';
import type { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { LeftArrowIcon } from '@/components/atoms/icons/filled/LeftArrowIcon';
import { RightArrowIcon } from '@/components/atoms/icons/filled/RightArrowIcon';
import { cn } from '@/lib/utils';

type CarouselSlide = {
  id: string;
  imageUrl: string;
};

type ProductCarouselIndicatorProps = {
  slides: CarouselSlide[];
  embla?: EmblaCarouselType;
};

export function ProductCarouselIndicator({
  slides = [],
  embla: parentEmbla,
}: ProductCarouselIndicatorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef] = useEmblaCarousel({
    axis: 'x',
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps',
  });

  const changeSlideHandler = useCallback(
    (index: number) => {
      parentEmbla?.scrollTo(index);
    },
    [parentEmbla],
  );

  const scrollPrevImage = useCallback(() => {
    parentEmbla?.scrollPrev();
  }, [parentEmbla]);

  const scrollNextImage = useCallback(() => {
    parentEmbla?.scrollNext();
  }, [parentEmbla]);

  const onSelectParent = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!parentEmbla) return;

    parentEmbla.on('reInit', onSelectParent).on('select', onSelectParent);
    return () => {
      parentEmbla.off('reInit', onSelectParent).off('select', onSelectParent);
    };
  }, [onSelectParent, parentEmbla]);

  return (
    <div className="mt-2 flex items-center gap-2">
      <Button
        type="button"
        onClick={scrollPrevImage}
        disabled={!canScrollPrev}
        variant="neutral"
        size="sm"
        uiType="icon"
        aria-label="Previous image"
        className={cn('shrink-0', !canScrollPrev && 'cursor-not-allowed')}
      >
        <LeftArrowIcon size={{ mobile: 20, desktop: 20 }} color="#949495" />
      </Button>

      <div className="embla flex-1 overflow-hidden" aria-label="Product image thumbnails">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-2 justify-center">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className="cursor-pointer"
                onClick={() => changeSlideHandler(index)}
                aria-label={`เลือกรูปที่ ${index + 1}`}
              >
                <Image
                  src={slide.imageUrl}
                  alt={`Product thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className={cn(
                    'border-4 transition-colors duration-300 w-20 h-20 object-cover',
                    selectedIndex === index
                      ? 'border-sop-primary-500'
                      : 'border-sop-base-white',
                  )}
                  draggable={false}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={scrollNextImage}
        disabled={!canScrollNext}
        variant="neutral"
        size="sm"
        uiType="icon"
        aria-label="Next image"
        className={cn('shrink-0', !canScrollNext && 'cursor-not-allowed')}
      >
        <RightArrowIcon size={{ mobile: 20, desktop: 20 }} color="#949495" />
      </Button>
    </div>
  );
}
