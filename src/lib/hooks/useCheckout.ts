'use client';

import { useCallback } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  CreateOrderDocument,
  CreatePaymentDocument,
  ValidatePromotionDocument,
  type CreateOrderInput,
  type CreateOrderMutation,
  type CreatePaymentInput,
  type CreatePaymentMutation,
  type ValidatePromotionInput,
  type ValidatePromotionQuery,
} from '@/lib/graphql/generated/graphql';
import type { CreatePaymentSubmitInput } from '@/lib/checkout/submitCheckout';

export type PromotionValidation = ValidatePromotionQuery['validatePromotion'];
export type CreatedOrder = CreateOrderMutation['createOrder'];
export type CreatedPayment = CreatePaymentMutation['createPayment'];

export type UseCheckoutResult = {
  validatePromotion: (input: ValidatePromotionInput) => Promise<PromotionValidation | undefined>;
  createOrder: (input: CreateOrderInput) => Promise<CreatedOrder | undefined>;
  createPayment: (input: CreatePaymentSubmitInput) => Promise<CreatedPayment | undefined>;
  validatingPromotion: boolean;
  creatingOrder: boolean;
  creatingPayment: boolean;
  loading: boolean;
  error: Error | undefined;
};

function toHookError(error: unknown): Error | undefined {
  if (!error) return undefined;
  return error as Error;
}

export function useCheckout(): UseCheckoutResult {
  const [runValidatePromotion, { loading: validatingPromotion, error: validatePromotionError }] =
    useLazyQuery(ValidatePromotionDocument, {
      fetchPolicy: 'network-only',
    });

  const [createOrderMutation, { loading: creatingOrder, error: createOrderError }] =
    useMutation(CreateOrderDocument);

  const [createPaymentMutation, { loading: creatingPayment, error: createPaymentError }] =
    useMutation(CreatePaymentDocument);

  const validatePromotion = useCallback(
    async (input: ValidatePromotionInput) => {
      const result = await runValidatePromotion({ variables: { input } });
      return result.data?.validatePromotion;
    },
    [runValidatePromotion],
  );

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      const result = await createOrderMutation({ variables: { input } });
      return result.data?.createOrder;
    },
    [createOrderMutation],
  );

  const createPayment = useCallback(
    async (input: CreatePaymentSubmitInput) => {
      // Cast until codegen regenerates CreatePaymentInput with saveCard.
      const result = await createPaymentMutation({
        variables: { input: input as CreatePaymentInput },
      });
      return result.data?.createPayment;
    },
    [createPaymentMutation],
  );

  const error = validatePromotionError ?? createOrderError ?? createPaymentError ?? undefined;

  return {
    validatePromotion,
    createOrder,
    createPayment,
    validatingPromotion,
    creatingOrder,
    creatingPayment,
    loading: validatingPromotion || creatingOrder || creatingPayment,
    error: toHookError(error),
  };
}
