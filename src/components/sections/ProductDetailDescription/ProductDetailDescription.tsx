import { ClipboardListIcon } from '@/components/atoms/icons/filled/ClipboardListIcon';
import { ProductDescriptionContent } from '@/components/molecules/ProductMarkdownContent/ProductMarkdownContent';

type ProductDetailDescriptionProps = {
  description: string | null | undefined;
};

export function ProductDetailDescription({ description }: ProductDetailDescriptionProps) {
  if (!description) return null;

  return (
    <div className="rounded-sop-16px bg-sop-base-white px-sop-16px py-4">
      <div className="flex items-center gap-sop-8px pb-sop-20px">
        <ClipboardListIcon
          size={{ mobile: 32, desktop: 32 }}
          color="#FFFFFF"
          className="p-sop-8px bg-sop-primary-500 rounded-full"
        />
        <h2 className="sop-body-md-medium lg:sop-body-md-medium">รายละเอียดสินค้า</h2>
      </div>
      <ProductDescriptionContent description={description} />
    </div>
  );
}
