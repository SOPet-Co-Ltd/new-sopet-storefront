import { CategoryPLP } from '@/components/sections/ProductListing';

type Props = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  return (
    <main className="container lg:px-20 px-4 py-4">
      <CategoryPLP categorySlug={category} />
    </main>
  );
}
