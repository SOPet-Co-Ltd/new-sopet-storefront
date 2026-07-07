import { ProductDescriptionContent } from '@/components/molecules/ProductMarkdownContent/ProductMarkdownContent';

type ProductDetailDescriptionProps = {
  description: string | null | undefined;
};

export function ProductDetailDescription({ description }: ProductDetailDescriptionProps) {
  if (!description) return null;

  return (
    <div className="bg-sop-base-white gap-4 p-4 md:rounded-sop-16px rounded-none md:mt-5 mt-2">
      <div className="border-b mb-4 py-2 border-sop-primary-500">
        <p className="md:sop-headline-md-medium sop-body-lg-medium text-sop-primary-700">
          รายละเอียดสินค้า
        </p>
      </div>
      <ProductDescriptionContent description={description} />
    </div>
  );
}
