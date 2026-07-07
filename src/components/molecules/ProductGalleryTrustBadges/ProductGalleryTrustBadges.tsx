import { AwardIcon } from '@/components/atoms/icons/filled/AwardIcon';
import { ShieldCheckIcon } from '@/components/atoms/icons/outline/ShieldCheckIcon';

export function ProductGalleryTrustBadges() {
  return (
    <div className="mt-3 flex gap-2 md:px-0 px-4" data-testid="product-gallery-trust-badges">
      <div className="flex flex-1 items-center gap-2 rounded-sop-8px bg-sop-additionalblue-300 px-3 py-2">
        <AwardIcon size={{ mobile: 20, desktop: 24 }} color="#FFFFFF" />
        <span className="sop-body-xs-regular md:sop-body-sm-regular text-sop-base-white">
          ราคาถูกที่สุด
        </span>
      </div>
      <div className="flex flex-1 items-center gap-2 rounded-sop-8px bg-sop-additionalblue-300 px-3 py-2">
        <ShieldCheckIcon size={{ mobile: 20, desktop: 24 }} color="#FFFFFF" />
        <span className="sop-body-xs-regular md:sop-body-sm-regular text-sop-base-white">
          ของแท้จากรพ.
        </span>
      </div>
    </div>
  );
}
