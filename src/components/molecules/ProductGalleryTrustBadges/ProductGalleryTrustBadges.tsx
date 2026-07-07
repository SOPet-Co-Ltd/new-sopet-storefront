import { AwardIcon } from '@/components/atoms/icons/filled/AwardIcon';
import { ShieldCheckIcon } from '@/components/atoms/icons/outline/ShieldCheckIcon';

export function ProductGalleryTrustBadges() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-stretch bg-sop-additionalblue-500"
      data-testid="product-gallery-trust-badges"
    >
      <div className="flex flex-1 items-center justify-center gap-2 px-3 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sop-base-white">
          <AwardIcon size={{ mobile: 16, desktop: 16 }} color="#6e76ee" />
        </span>
        <span className="sop-body-xs-regular text-sop-base-white md:sop-body-sm-regular">
          ราคาถูกที่สุด
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2 px-3 py-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sop-base-white">
          <ShieldCheckIcon size={{ mobile: 16, desktop: 16 }} color="#6e76ee" />
        </span>
        <span className="sop-body-xs-regular text-sop-base-white md:sop-body-sm-regular">
          ของแท้จากรพ.
        </span>
      </div>
    </div>
  );
}
