import Image from 'next/image';
import Link from 'next/link';

export type HomeSectionProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  thumbnailUrl: string | null;
  averageRating?: number;
  reviewCount?: number;
  soldCount?: number;
};

type HomeSectionProductCardProps = {
  product: HomeSectionProduct;
  compact?: boolean;
};

export function HomeSectionProductCard({ product, compact = false }: HomeSectionProductCardProps) {
  const widthClass = compact ? 'w-[168px]' : 'md:w-[223px] w-[168px]';
  const heightClass = compact ? 'h-[168px]' : 'md:h-[223px] h-[168px]';

  return (
    <Link
      href={`/product/${product.id}`}
      aria-label={`ดู ${product.name}`}
      title={`ดู ${product.name}`}
      className="block shrink-0"
    >
      <div
        className={`${widthClass} md:max-w-[223px] max-w-[168px] md:rounded-sop-24px rounded-sop-16px overflow-hidden bg-sop-base-white`}
      >
        <div className={`${widthClass} ${heightClass}`}>
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              width={223}
              height={223}
              className="w-full h-full aspect-square object-cover object-center pointer-events-none select-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center bg-sop-additionalblue-300">
              <p className="md:sop-body-sm-regular sop-body-xs-regular text-sop-base-white line-clamp-2">
                ไม่มีรูปภาพ
              </p>
            </div>
          )}
        </div>
        <div className="py-2 md:px-3 px-2 pb-5 flex flex-col gap-1">
          <p className="sop-body-sm-regular text-sop-neutral-gray-300 line-clamp-2 h-sop-40px">
            {product.name}
          </p>
          <span className="text-sop-secondary-500 rounded-sop-8px md:sop-body-lg-medium sop-body-lg-medium">
            ฿{product.basePrice.toLocaleString('th-TH')}
          </span>
        </div>
      </div>
    </Link>
  );
}
