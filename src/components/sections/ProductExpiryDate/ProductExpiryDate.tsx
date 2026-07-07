import { JarOfPillsIcon } from '@/components/atoms/icons/filled/JarOfPillsIcon';

type ProductExpiryDateProps = {
  expiryDate: string | null | undefined;
};

export function ProductExpiryDate({ expiryDate }: ProductExpiryDateProps) {
  if (!expiryDate) return null;

  return (
    <div className="flex w-full">
      <div className="flex w-full items-center gap-2 rounded-sop-8 bg-sop-primary-100 px-2 py-[9px]">
        <JarOfPillsIcon size={{ mobile: 24, desktop: 24 }} />
        <p className="sop-body-md-medium text-sop-primary-700 lg:sop-body-lg-medium">
          วันหมดอายุ : {expiryDate}
        </p>
      </div>
    </div>
  );
}
