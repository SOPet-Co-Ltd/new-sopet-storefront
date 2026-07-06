import { OrderConfirmedContent } from './OrderConfirmedContent';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmedPage(props: Props) {
  const { id } = await props.params;
  return <OrderConfirmedContent orderId={id} />;
}
