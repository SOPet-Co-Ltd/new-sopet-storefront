import { ProductDescriptionContent } from '@/components/molecules/ProductMarkdownContent/ProductMarkdownContent';

type ProductDetailDescriptionProps = {
  description: string | null | undefined;
};

export function ProductDetailDescription({ description }: ProductDetailDescriptionProps) {
  if (!description) return null;

  return (
    <div className="-mx-4 bg-sop-base-white p-4 rounded-none md:mx-0 md:rounded-sop-16px">
      <div className="border-b mb-4 py-2 border-sop-primary-500">
        <p className="md:sop-headline-md-medium sop-body-lg-medium text-sop-primary-700">
          รายละเอียดสินค้า
        </p>
      </div>
      <ProductDescriptionContent description={description} />
    </div>
  );
}
