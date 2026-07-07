import { WarningIcon } from '@/components/atoms/icons/filled/WarningIcon';

type ProductDetailWarningProps = {
  warning: string | null | undefined;
};

export function ProductDetailWarning({ warning }: ProductDetailWarningProps) {
  if (!warning) return null;

  return (
    <div className="-mx-4 bg-sop-base-white p-4 rounded-none md:mx-0 md:rounded-sop-16px">
      <div className="flex items-center gap-2 mb-2">
        <WarningIcon size={{ mobile: 24, desktop: 24 }} />
        <p className="md:sop-body-lg-medium sop-body-md-medium text-sop-primary-700">คำเตือน</p>
      </div>
      <p className="md:sop-body-md-regular sop-body-sm-regular text-sop-neutral-gray-400">
        {warning}
      </p>
    </div>
  );
}
