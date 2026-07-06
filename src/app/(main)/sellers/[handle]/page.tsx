import { SellerStorefront } from '@/components/organisms/SellerTabs';

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function SellerPage({ params }: Props) {
  const { handle } = await params;

  return (
    <main className="container lg:px-20 px-4 py-4">
      <SellerStorefront handle={handle} activeTab="products" />
    </main>
  );
}
