import Image, { StaticImageData } from "next/image"
import { StarFillIcon } from "@/components/atoms/icons/filled/StarFillIcon"
import Link from "next/link"

type ProductCardProps = {
  image: string | StaticImageData
  title: string
  price: number
  originalPrice?: number
  rating?: number
  ratingCount?: number
  saleCount?: number
  discount?: number
  hasFreeShipping?: boolean
  isAuthentic?: boolean
}

export default function ProductCard({
  image,
  title,
  price,
  originalPrice,
  rating = 0,
  ratingCount = 0,
  saleCount = 0,
  discount,
  hasFreeShipping = false,
  isAuthentic = false
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${title}`}
      aria-label={`View ${title}`}
      title={`View ${title}`}
    >
      <div className="md:w-[223px] w-[168px] md:max-w-[223px] max-w-[168px] md:rounded-sop-24px rounded-sop-16px overflow-hidden bg-sop-base-white">
        <div className="md:w-[223px] w-[168px] md:h-[223px] h-[168px]">
          {image && typeof image === "string" ? (
            <Image
              fetchPriority={"auto"}
              src={image}
              alt="Product image"
              width={223}
              height={223}
              quality={85}
              className="w-full h-auto aspect-square object-cover object-center pointer-events-none select-none"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full flex justify-center items-center bg-sop-additionalblue-300">
              <p className="md:sop-body-sm-regular sop-body-xs-regular text-sop-base-white line-clamp-2 h-sop-40px">
                No image
              </p>
            </div>
          )}
        </div>
        <div className="py-2 md:px-3 px-2 pb-5 flex flex-col gap-1">
          <p className="sop-body-sm-regular text-sop-neutral-gray-300 line-clamp-2 h-sop-40px">
            {title}
          </p>
          <div>
            <div className="flex gap-2 items-center">
              {price}
              {price ? (
                <>
                  <span className="text-sop-secondary-500 rounded-sop-8px md:sop-body-lg-medium sop-body-lg-medium">
                    ฿{price}
                  </span>
                </>
              ) : (
                <span className="label-md text-secondary pt-2 pb-4">
                  Not available in your region
                </span>
              )}
            </div>
          </div>
          <div>
            <StarFillIcon size={{ mobile: 14, desktop: 14 }} color="#FDB022" />
            <span>{rating}</span>
            <span>{ratingCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
