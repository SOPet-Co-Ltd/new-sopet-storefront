'use client';

import { ShareIcon } from '@/components/atoms/icons/filled/ShareIcon';
import { WishListHeartIcon } from '@/components/atoms/icons/filled/WishListHeartIcon';
import { cn } from '@/lib/utils';

type ProductShareWishlistActionsProps = {
  productName: string;
  onShare: () => void;
  onWishlist: () => void;
  disabled?: boolean;
  isWishlisted?: boolean;
  wishlistLoading?: boolean;
  className?: string;
};

export function ProductShareWishlistActions({
  productName,
  onShare,
  onWishlist,
  disabled = false,
  isWishlisted = false,
  wishlistLoading = false,
  className,
}: ProductShareWishlistActionsProps) {
  return (
    <div className={cn('flex items-center gap-[18px]', className)}>
      <button
        type="button"
        onClick={onShare}
        disabled={disabled}
        className="cursor-pointer disabled:opacity-40"
        aria-label={`แชร์ ${productName}`}
      >
        <ShareIcon size={{ mobile: 24, desktop: 32 }} color="#9c6ade" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onWishlist}
        disabled={wishlistLoading}
        aria-pressed={isWishlisted}
        className="cursor-pointer disabled:opacity-40"
        aria-label={
          isWishlisted ? `นำ ${productName} ออกจากรายการโปรด` : `เพิ่ม ${productName} ในรายการโปรด`
        }
      >
        <WishListHeartIcon size={{ mobile: 24, desktop: 36 }} filled={isWishlisted} />
      </button>
    </div>
  );
}
