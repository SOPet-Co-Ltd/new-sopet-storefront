'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LeftArrowIcon } from '@/components/atoms/icons/filled/LeftArrowIcon';
import { RightArrowIcon } from '@/components/atoms/icons/filled/RightArrowIcon';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductImage = NonNullable<ProductDetail['images']>[number];

type ProductDetailsHeaderProps = {
  productName: string;
  images: ProductImage[] | null;
  thumbnailUrl: string | null;
};

function resolveGalleryImages(
  images: ProductImage[] | null,
  thumbnailUrl: string | null,
): ProductImage[] {
  if (images && images.length > 0) {
    return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
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

export default function ProductDetailsHeader({
  productName,
  images,
  thumbnailUrl,
}: ProductDetailsHeaderProps) {
  const slides = resolveGalleryImages(images, thumbnailUrl);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (slides.length === 0) {
    return (
      <div
        className="w-full aspect-square flex items-center justify-center bg-sop-additionalblue-300 rounded-sop-16px"
        data-testid="product-gallery-empty"
      >
        <p className="sop-body-sm-regular text-sop-base-white">ไม่มีรูปภาพ</p>
      </div>
    );
  }

  const currentSlide = slides[selectedIndex] ?? slides[0];
  const hasMultiple = slides.length > 1;

  const goToPrevious = () => {
    setSelectedIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  };

  const goToNext = () => {
    setSelectedIndex((index) => (index === slides.length - 1 ? 0 : index + 1));
  };

  return (
    <div data-testid="product-gallery">
      <div className="relative w-full">
        <Image
          src={currentSlide.imageUrl}
          alt={productName}
          width={700}
          height={700}
          className="w-full h-auto aspect-square object-cover object-center rounded-sop-16px"
          priority
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              aria-label="รูปก่อนหน้า"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-sop-neutral-whitealpha-700"
            >
              <LeftArrowIcon size={{ mobile: 12, desktop: 12 }} color="#211f23" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="รูปถัดไป"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-sop-neutral-whitealpha-700"
            >
              <RightArrowIcon size={{ mobile: 12, desktop: 12 }} color="#211f23" />
            </button>
            <div className="absolute bottom-4 right-2 rounded-sop-12px bg-sop-neutral-whitealpha-800 px-sop-16px py-1.5 md:hidden">
              <span className="sop-body-xs-regular">
                {selectedIndex + 1}/{slides.length}
              </span>
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div
          className="mt-3 hidden md:flex gap-2 overflow-x-auto"
          data-testid="product-gallery-thumbnails"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`เลือกรูปที่ ${index + 1}`}
              aria-current={index === selectedIndex}
              className={`shrink-0 overflow-hidden rounded-sop-8px border-2 ${
                index === selectedIndex ? 'border-sop-primary-500' : 'border-transparent'
              }`}
            >
              <Image
                src={slide.imageUrl}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
