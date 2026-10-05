import { JarOfPillsIcon } from '@/components/atoms/icons/filled/JarOfPillsIcon';

type ProductExpiryDateProps = {
  expiryDate: string | null | undefined;
};

export function ProductExpiryDate({ expiryDate }: ProductExpiryDateProps) {
  if (!expiryDate) return null;

  return (
    <div className="flex w-full lg:hidden">
      <div className="flex w-full items-center gap-2 rounded-sop-8 bg-sop-primary-100 px-3 py-2 text-sop-primary-700">
        <JarOfPillsIcon size={{ mobile: 20, desktop: 20 }} />
        <p className="sop-body-sm-medium text-sop-primary-700">วันหมดอายุ : {expiryDate}</p>
      </div>
    </div>
  );
}
