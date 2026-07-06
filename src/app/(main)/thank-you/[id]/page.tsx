import { ThankYouPageContent } from './ThankYouPageContent';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ThankYouPage(props: Props) {
  const { id } = await props.params;
  return <ThankYouPageContent orderId={id} />;
}
