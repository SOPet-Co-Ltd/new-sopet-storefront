import { JarOfPillsIcon } from '@/components/atoms/icons/filled/JarOfPillsIcon';

type ProductExpiryDateProps = {
  expiryDate: string | null | undefined;
};

export function ProductExpiryDate({ expiryDate }: ProductExpiryDateProps) {
  if (!expiryDate) return null;

  return (
    <div className="flex w-full">
      <div className="flex items-center gap-2 bg-sop-primary-100 p-2 rounded-sop-8px w-full">
        <JarOfPillsIcon size={{ mobile: 24, desktop: 24 }} />
        <p className="md:sop-body-lg-medium sop-body-md-medium text-sop-primary-700">
          วันหมดอายุ : {expiryDate}
        </p>
      </div>
    </div>
  );
}
