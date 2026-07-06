import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@/components/atoms/icons/filled/StarIcon';
import type { ProductListItem } from '@/lib/hooks/useProducts';

export type ProductCardProduct = Pick<
  ProductListItem,
  | 'id'
  | 'name'
  | 'slug'
  | 'storeId'
  | 'basePrice'
  | 'compareAtPrice'
  | 'thumbnailUrl'
  | 'averageRating'
  | 'reviewCount'
  | 'soldCount'
>;

type ProductCardProps = {
  product: ProductCardProduct;
};

function buildProductHref(productId: string): string {
  return `/product/${productId}`;
}

function formatSoldCount(count: number): string {
  if (count < 1000) return count.toString();

  const units = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(count) / 3);
  const scaled = count / 10 ** (magnitude * 3);
  const formatted = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);

  return `${formatted}${units[magnitude]}`;
}

function ProductCardPrice({ product }: { product: ProductCardProduct }) {
  const hasPrice = product.basePrice > 0;

  if (!hasPrice) {
    return (
      <span className="label-md text-secondary pt-2 pb-4">ไม่มีสินค้าในพื้นที่ของคุณ</span>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sop-secondary-500 rounded-sop-8px md:sop-body-lg-medium sop-body-lg-medium">
        ฿{product.basePrice.toLocaleString('th-TH')}
      </span>
      {product.compareAtPrice != null && product.compareAtPrice > product.basePrice && (
        <span className="text-sop-neutral-grayalpha-400 md:sop-strike-sm-regular sop-strike-sm-regular">
          ฿{product.compareAtPrice.toLocaleString('th-TH')}
        </span>
      )}
    </div>
  );
}

function ProductCardReviewStars({ product }: { product: ProductCardProduct }) {
  const averageRating = product.averageRating ?? 0;
  const totalReviews = product.reviewCount ?? 0;
  const soldCount = product.soldCount ?? 0;

  return (
    <div className="grid grid-cols-[auto_1fr] gap-1 justify-center items-center">
      <div className="md:flex gap-2 hidden">
        <StarIcon color="#ffb514" size={{ mobile: 16, desktop: 16 }} />
      </div>
      <div className="flex gap-2 md:hidden">
        <StarIcon color="#ffb514" size={{ mobile: 14, desktop: 14 }} />
      </div>
      <div className="flex items-center justify-between">
        <p className="md:sop-body-sm-regular sop-body-xs-regular text-sop-neutral-gray-400">
          {averageRating} ({totalReviews} รีวิว)
        </p>
        <p className="md:sop-body-xs-regular sop-body-xs-regular text-sop-neutral-gray-400">
          ขายแล้ว {formatSoldCount(soldCount)} ชิ้น
        </p>
      </div>
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const href = buildProductHref(product.id);

  return (
    <Link
      href={href}
      aria-label={`ดู ${product.name}`}
      title={`ดู ${product.name}`}
      className="block"
    >
      <div className="md:w-[223px] w-[168px] md:max-w-[223px] max-w-[168px] md:rounded-sop-24px rounded-sop-16px overflow-hidden bg-sop-base-white">
        <div className="md:w-[223px] w-[168px] md:h-[223px] h-[168px]">
          {product.thumbnailUrl ? (
            <Image
              fetchPriority="auto"
              src={product.thumbnailUrl}
              alt={product.name}
              width={223}
              height={223}
              quality={85}
              className="w-full h-auto aspect-square object-cover object-center pointer-events-none select-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center bg-sop-additionalblue-300">
              <p className="md:sop-body-sm-regular sop-body-xs-regular text-sop-base-white line-clamp-2 h-sop-40px">
                ไม่มีรูปภาพ
              </p>
            </div>
          )}
        </div>
        <div className="py-2 md:px-3 px-2 pb-5 flex flex-col gap-1">
          <p className="sop-body-sm-regular text-sop-neutral-gray-300 line-clamp-2 h-sop-40px">
            {product.name}
          </p>
          <ProductCardPrice product={product} />
          <ProductCardReviewStars product={product} />
        </div>
      </div>
    </Link>
  );
}

export { buildProductHref };
