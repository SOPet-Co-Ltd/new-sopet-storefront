type ProductThumbnailProps = {
  imageUrl?: string | null;
  alt: string;
  size?: 'sm' | 'md';
};

const SIZE_CLASS = {
  sm: 'h-14 w-14',
  md: 'h-20 w-20',
} as const;

export function ProductThumbnail({ imageUrl, alt, size = 'md' }: ProductThumbnailProps) {
  const dimensionClass = SIZE_CLASS[size];

  if (!imageUrl) {
    return (
      <div
        className={`flex ${dimensionClass} shrink-0 items-center justify-center rounded-sop-8px border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-600 text-center sop-body-xs-regular text-sop-neutral-gray-400`}
        data-testid="product-thumbnail-fallback"
      >
        ไม่มีรูป
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${dimensionClass} shrink-0 rounded-sop-8px border border-sop-neutral-grayalpha-200 object-cover`}
      data-testid="product-thumbnail-image"
    />
  );
}
