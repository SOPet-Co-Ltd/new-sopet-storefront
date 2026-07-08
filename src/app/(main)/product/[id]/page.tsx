import ProductDetailsPage from '@/components/sections/ProductDetailsPage';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="container mx-auto lg:px-20 px-4 py-4 pb-24 md:pb-24 max-w-full">
      <ProductDetailsPage productId={id} />
    </main>
  );
}
