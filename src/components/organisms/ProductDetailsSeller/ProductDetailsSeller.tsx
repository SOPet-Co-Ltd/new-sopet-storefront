'use client';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChatDotsIcon, ShopVendorIcon } from '@/components/atoms/icons';
import type { ProductDetail } from '@/lib/hooks/useProduct';

type ProductDetailsSellerProps = {
  store: ProductDetail['store'];
};

export default function ProductDetailsSeller({ store }: ProductDetailsSellerProps) {
  if (!store) return null;

  const handleChat = () => {
    toast.message('ฟีเจอร์แชทพูดคุยจะเปิดใช้งานเร็วๆ นี้');
  };

  return (
    <div
      className="w-full lg:rounded-2xl md:rounded-2xl rounded-none border border-[#F0EDF5] bg-sop-base-white p-4 shadow-xs md:p-6"
      data-testid="product-seller"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left / Top: Store Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <Link href={`/sellers/${store.slug}`} className="shrink-0" aria-label={store.name}>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-sop-neutral-gray-500">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center sop-body-xs-regular text-sop-neutral-gray-400">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
          </Link>

          <div className="flex flex-col gap-1 min-w-0">
            <Link href={`/sellers/${store.slug}`} className="min-w-0">
              <p className="sop-body-md-medium text-sop-neutral-gray-100 truncate hover:underline">
                {store.name}
              </p>
            </Link>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] px-2.5 py-0.5 w-fit">
              <svg
                className="h-3.5 w-3.5 text-[#12B76A] shrink-0"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm3.78-9.72a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.28 6.72a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l4-4Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-[#027A48]">ร้านค้าแนะนำ</span>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Action Buttons */}
        <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:gap-3">
          <button
            type="button"
            onClick={handleChat}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sop-neutral-grayalpha-200 bg-sop-base-white px-4 py-2.5 text-sm font-medium text-sop-neutral-gray-200 shadow-2xs transition-colors hover:bg-sop-neutral-gray-500 cursor-pointer"
            data-testid="seller-chat-button"
          >
            <ChatDotsIcon size={{ mobile: 18, desktop: 18 }} color="#FF6F61" className="shrink-0" />
            <span>แชทพูดคุย</span>
          </button>

          <Link
            href={`/sellers/${store.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sop-neutral-grayalpha-200 bg-sop-base-white px-4 py-2.5 text-sm font-medium text-sop-neutral-gray-200 shadow-2xs transition-colors hover:bg-sop-neutral-gray-500"
            data-testid="seller-store-link"
          >
            <ShopVendorIcon
              size={{ mobile: 18, desktop: 18 }}
              color="#FF6F61"
              className="shrink-0"
            />
            <span>ไปยังร้านค้า</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
