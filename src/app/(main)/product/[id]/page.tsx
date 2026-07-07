import ProductDetailsPage from '@/components/sections/ProductDetailsPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="container lg:px-20 px-4 py-4 pb-24 md:pb-4 max-w-[1280px]">
      <ProductDetailsPage productId={id} />
    </main>
  );
}
