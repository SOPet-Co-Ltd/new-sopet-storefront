'use client';

import { ShareIcon } from '@/components/atoms/icons/filled/ShareIcon';
import { WishListHeartIcon } from '@/components/atoms/icons/filled/WishListHeartIcon';
import { cn } from '@/lib/utils';

type ProductShareWishlistActionsProps = {
  productName: string;
  onShare: () => void;
  onWishlist: () => void;
  disabled?: boolean;
  className?: string;
};

export function ProductShareWishlistActions({
  productName,
  onShare,
  onWishlist,
  disabled = false,
  className,
}: ProductShareWishlistActionsProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={onShare}
        disabled={disabled}
        className="cursor-pointer disabled:opacity-40"
        aria-label={`แชร์ ${productName}`}
      >
        <ShareIcon size={{ mobile: 24, desktop: 24 }} color="#9c6ade" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onWishlist}
        className="cursor-pointer"
        aria-label={`เพิ่ม ${productName} ในรายการโปรด`}
      >
        <WishListHeartIcon size={{ mobile: 24, desktop: 24 }} />
      </button>
    </div>
  );
}
