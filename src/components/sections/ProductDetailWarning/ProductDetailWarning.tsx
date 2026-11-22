import { DangerTriangleIcon } from '@/components/atoms/icons/filled/DangerTriangleIcon';

type ProductDetailWarningProps = {
  warning: string | null | undefined;
};

export function ProductDetailWarning({ warning }: ProductDetailWarningProps) {
  if (!warning) return null;

  return (
    <section className="-mx-4 overflow-hidden rounded-none bg-sop-base-white md:mx-0 md:rounded-sop-20">
      <div className="flex items-center px-sop-24px py-sop-20px">
        <div className="flex items-center gap-sop-8px">
          <span className="flex rounded-sop-20 bg-sop-system-warning-300 p-sop-8px">
            <DangerTriangleIcon size={{ mobile: 16, desktop: 16 }} color="#FFFFFF" />
          </span>
          <h2 className="sop-body-md font-semibold text-sop-neutral-gray-200">คำเตือน</h2>
        </div>
      </div>
      <div className="px-sop-24px pb-sop-24px">
        <div className="rounded-sop-12 bg-sop-system-warning-100 p-sop-20px">
          <p className="sop-body-md-medium text-sop-neutral-gray-200">{warning}</p>
        </div>
      </div>
    </section>
  );
}
