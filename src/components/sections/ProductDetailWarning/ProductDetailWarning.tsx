import { WarningIcon } from '@/components/atoms/icons/filled/WarningIcon';

type ProductDetailWarningProps = {
  warning: string | null | undefined;
};

export function ProductDetailWarning({ warning }: ProductDetailWarningProps) {
  if (!warning) return null;

  return (
    <div className="bg-sop-base-white gap-4 p-4 md:rounded-lg rounded-none md:mt-5 mt-2">
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
