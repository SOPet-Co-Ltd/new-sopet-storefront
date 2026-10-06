'use client';

import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { SOPetLogo } from '@/components/atoms/icons';
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
              <p className="sop-headline-sm-bold text-sop-neutral-gray-100 truncate hover:underline">
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
            <svg
              className="h-4.5 w-4.5 text-sop-secondary-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
            <span>แชทพูดคุย</span>
          </button>

          <Link
            href={`/sellers/${store.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sop-neutral-grayalpha-200 bg-sop-base-white px-4 py-2.5 text-sm font-medium text-sop-neutral-gray-200 shadow-2xs transition-colors hover:bg-sop-neutral-gray-500"
            data-testid="seller-store-link"
          >
            <svg
              className="h-4.5 w-4.5 text-sop-secondary-500 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
              <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
            </svg>
            <span>ไปยังร้านค้า</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
