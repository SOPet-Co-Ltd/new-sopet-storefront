import { SellerStorefront } from '@/components/organisms/SellerTabs';

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function SellerReviewsPage({ params }: Props) {
  const { handle } = await params;

  return (
    <main className="w-full min-h-[calc(100dvh-109px)] px-4 py-4 lg:px-20">
      <SellerStorefront handle={handle} activeTab="reviews" />
    </main>
  );
}
