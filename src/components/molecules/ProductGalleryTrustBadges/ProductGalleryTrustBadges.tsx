import { AwardIcon } from '@/components/atoms/icons/filled/AwardIcon';
import { ShieldCheckIcon } from '@/components/atoms/icons/outline/ShieldCheckIcon';

export function ProductGalleryTrustBadges() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 flex items-stretch bg-[#6e76ee] py-1.5"
      data-testid="product-gallery-trust-badges"
    >
      <div className="flex flex-1 items-center justify-center gap-2 px-3 py-1">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sop-base-white shadow-xs">
          <AwardIcon size={{ mobile: 14, desktop: 14 }} color="#6e76ee" />
        </span>
        <span className="sop-body-xs-regular text-sop-base-white font-medium md:sop-body-sm-regular">
          ราคาถูกที่สุด
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2 px-3 py-1">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-sop-base-white shadow-xs">
          <ShieldCheckIcon size={{ mobile: 14, desktop: 14 }} color="#6e76ee" />
        </span>
        <span className="sop-body-xs-regular text-sop-base-white font-medium md:sop-body-sm-regular">
          ของแท้จากรพ.
        </span>
      </div>
    </div>
  );
}
