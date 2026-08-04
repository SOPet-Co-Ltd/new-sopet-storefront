import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { GraphQLError } from 'graphql';
import {
  isPaymentHeldPortionBlockedError,
  mapCheckoutSuspendedStoreError,
  mapStoreSuspendedCartError,
} from './mapSuspensionErrors';
import { STORE_SUSPENSION_HOLD_COPY } from '@/lib/constants/storeSuspensionHoldCopy';

function gqlError(code: string, message = code) {
  return new CombinedGraphQLErrors({
    errors: [new GraphQLError(message, { extensions: { code } })],
  });
}

describe('mapSuspensionErrors', () => {
  it('maps STORE_SUSPENDED to cart.add.suspended copy', () => {
    expect(mapStoreSuspendedCartError(gqlError('STORE_SUSPENDED'))).toBe(
      STORE_SUSPENSION_HOLD_COPY.cartAddSuspended,
    );
  });

  it('maps ORDER_CONTAINS_SUSPENDED_STORE to checkout.create.suspended copy', () => {
    expect(mapCheckoutSuspendedStoreError(gqlError('ORDER_CONTAINS_SUSPENDED_STORE'))).toBe(
      STORE_SUSPENSION_HOLD_COPY.checkoutCreateSuspended,
    );
  });

  it('detects PAYMENT_HELD_PORTION_BLOCKED', () => {
    expect(isPaymentHeldPortionBlockedError(gqlError('PAYMENT_HELD_PORTION_BLOCKED'))).toBe(true);
  });
});
