import { Suspense } from 'react';
import { ThankYouPageContent } from './ThankYouPageContent';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ThankYouPage(props: Props) {
  const { id } = await props.params;
  return (
    <Suspense
      fallback={<div className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</div>}
    >
      <ThankYouPageContent orderId={id} />
    </Suspense>
  );
}
