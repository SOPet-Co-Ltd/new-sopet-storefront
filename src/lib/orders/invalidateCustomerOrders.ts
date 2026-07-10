import { getApolloClient } from '@/lib/graphql/client';
import { OrderDocument, OrdersDocument } from '@/lib/graphql/generated/graphql';

export function invalidateCustomerOrders(): Promise<unknown> {
  return getApolloClient().refetchQueries({
    include: [OrdersDocument, OrderDocument],
  });
}
