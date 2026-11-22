import { HeartFillIcon } from '@/components/atoms/icons/filled/HeartFillIcon';
import { HeartIcon } from '@/components/atoms/icons/filled/HeartIcon';
import { ShareArrowIcon } from '@/components/atoms/icons/outline/ShareArrowIcon';
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
    <div className={cn('flex items-center gap-2.5', className)}>
      <button
        type="button"
        onClick={onShare}
        disabled={disabled}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-sop-primary-100 text-sop-secondary-500 transition-colors hover:bg-sop-primary-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`แชร์ ${productName}`}
      >
        <ShareArrowIcon size={{ mobile: 20, desktop: 20 }} color="#9c6ade" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onWishlist}
        disabled={wishlistLoading}
        aria-pressed={isWishlisted}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-sop-primary-100 text-sop-secondary-500 transition-colors hover:bg-sop-primary-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={
          isWishlisted ? `นำ ${productName} ออกจากรายการโปรด` : `เพิ่ม ${productName} ในรายการโปรด`
        }
      >
        {isWishlisted ? (
          <HeartFillIcon size={{ mobile: 20, desktop: 20 }} color="#9c6ade" />
        ) : (
          <HeartIcon size={{ mobile: 20, desktop: 20 }} color="#9c6ade" />
        )}
      </button>
    </div>
  );
}
