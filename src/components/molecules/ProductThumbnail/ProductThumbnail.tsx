type ProductThumbnailProps = {
  imageUrl?: string | null;
  alt: string;
};

export function ProductThumbnail({ imageUrl, alt }: ProductThumbnailProps) {
  if (!imageUrl) {
    return (
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-sop-8px border border-sop-neutral-grayalpha-200 bg-sop-neutral-gray-600 text-center sop-body-xs-regular text-sop-neutral-gray-400"
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
      className="h-20 w-20 shrink-0 rounded-sop-8px border border-sop-neutral-grayalpha-200 object-cover"
      data-testid="product-thumbnail-image"
    />
  );
}
