'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { CloseIcon } from '@/components/atoms/icons/filled/CloseIcon';
import { LeftArrowIcon } from '@/components/atoms/icons/filled/LeftArrowIcon';
import { RightArrowIcon } from '@/components/atoms/icons/filled/RightArrowIcon';

export type ReviewImage = {
  id: string;
  url: string;
};

type ReviewImagesGridProps = {
  images: ReviewImage[];
  size?: number;
};

export function ReviewImagesGrid({ images, size = 64 }: ReviewImagesGridProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const showPrevious = useCallback(() => {
    setSelectedIndex((current) => (current > 0 ? current - 1 : current));
  }, []);

  const showNext = useCallback(() => {
    setSelectedIndex((current) => (current < images.length - 1 ? current + 1 : current));
  }, [images.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        showPrevious();
      } else if (event.key === 'ArrowRight') {
        showNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeLightbox, isLightboxOpen, showNext, showPrevious]);

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[selectedIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2" data-testid="review-images-grid">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            aria-label={`ดูรูปรีวิวที่ ${index + 1}`}
            onClick={() => openLightbox(index)}
            className="overflow-hidden rounded-sop-8px"
          >
            <Image
              src={image.url}
              alt=""
              width={size}
              height={size}
              className="rounded-sop-8px object-cover"
              style={{ width: size, height: size }}
            />
          </button>
        ))}
      </div>

      {isLightboxOpen && currentImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-sop-neutral-grayalpha-500 backdrop-blur-sm"
          data-testid="review-image-lightbox"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-sop-neutral-gray-300 transition-colors hover:bg-sop-neutral-gray-400"
            aria-label="Close lightbox"
          >
            <CloseIcon size={{ mobile: 20, desktop: 20 }} color="#f5f5f5" />
          </button>

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={showPrevious}
                disabled={selectedIndex === 0}
                className="absolute left-4 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-sop-neutral-whitealpha-700 transition-colors hover:bg-sop-neutral-whitealpha-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous image"
              >
                <LeftArrowIcon size={{ mobile: 8, desktop: 8 }} color="#211f23" />
              </button>
              <button
                type="button"
                onClick={showNext}
                disabled={selectedIndex === images.length - 1}
                className="absolute right-4 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-sop-neutral-whitealpha-700 transition-colors hover:bg-sop-neutral-whitealpha-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next image"
              >
                <RightArrowIcon size={{ mobile: 8, desktop: 8 }} color="#211f23" />
              </button>
            </>
          ) : null}

          <div className="flex h-full w-full items-center justify-center px-4 md:px-8 lg:px-16">
            <Image
              src={currentImage.url}
              alt=""
              width={1200}
              height={1200}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              data-testid="review-image-lightbox-image"
              sizes="85vw"
            />
          </div>

          {hasMultipleImages ? (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sop-body-sm-regular text-sop-base-white">
              {selectedIndex + 1}/{images.length}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
