import { readFileSync, writeFileSync } from 'node:fs';

const filePath = process.argv[2];
if (!filePath?.endsWith('graphql.ts')) {
  process.exit(0);
}

const duplicateBlocks = [
  '\nexport type RefreshTokenInput = {\n  refreshToken: string;\n};\n',
  '\nexport type ReactivateAccountInput = {\n  reactivationToken: string;\n};\n',
  '\nexport type SendCustomerOtpInput = {\n  phone: string;\n};\n',
  '\nexport type VerifyCustomerOtpInput = {\n  code: string;\n  phone: string;\n  sessionId?: string | null | undefined;\n};\n',
  '\nexport type AddToCartInput = {\n  quantity: number;\n  sessionId?: string | null | undefined;\n  variantId: string;\n};\n',
  '\nexport type RemoveCartItemInput = {\n  itemId: string;\n  sessionId?: string | null | undefined;\n};\n',
  '\nexport type UpdateCartItemInput = {\n  itemId: string;\n  quantity: number;\n  sessionId?: string | null | undefined;\n};\n',
  '\nexport type CreateAddressInput = {\n  addressLine1: string;\n  addressLine2?: string | null | undefined;\n  amphoe: string;\n  city?: string | null | undefined;\n  isDefault?: boolean | null | undefined;\n  label: string;\n  postalCode: string;\n  province: string;\n  recipientName: string;\n  recipientPhone: string;\n  tumbon?: string | null | undefined;\n};\n',
  '\nexport type CreateOrderInput = {\n  guestEmail?: string | null | undefined;\n  guestName?: string | null | undefined;\n  guestPhone?: string | null | undefined;\n  items: Array<OrderItemInput>;\n  notes?: string | null | undefined;\n  paymentMethod: string;\n  platformPromotionCode?: string | null | undefined;\n  promotionCode?: string | null | undefined;\n  savedAddressId?: string | null | undefined;\n  shippingAddress?: ShippingAddressInput | null | undefined;\n  storePromotionCodes?: Array<string> | null | undefined;\n  storeShipping?: Array<StoreShippingSelectionInput> | null | undefined;\n};\n',
  '\nexport type CreatePaymentInput = {\n  amount: number;\n  currency?: string;\n  omiseToken?: string | null | undefined;\n  orderId: string;\n  paymentMethod: string;\n  savedPaymentMethodId?: string | null | undefined;\n};\n',
  '\nexport type OrderItemInput = {\n  price: number;\n  productId: string;\n  quantity: number;\n  variantId?: string | null | undefined;\n};\n',
  '\nexport type ShippingAddressInput = {\n  addressLine1: string;\n  addressLine2?: string | null | undefined;\n  amphoe: string;\n  city?: string | null | undefined;\n  postalCode: string;\n  province: string;\n  recipientName: string;\n  recipientPhone: string;\n  tumbon?: string | null | undefined;\n};\n',
  '\nexport type StoreShippingSelectionInput = {\n  shippingOptionId: string;\n  storeId: string;\n};\n',
  '\nexport type UpdateAddressInput = {\n  addressLine1?: string | null | undefined;\n  addressLine2?: string | null | undefined;\n  amphoe?: string | null | undefined;\n  city?: string | null | undefined;\n  isDefault?: boolean | null | undefined;\n  label?: string | null | undefined;\n  postalCode?: string | null | undefined;\n  province?: string | null | undefined;\n  recipientName?: string | null | undefined;\n  recipientPhone?: string | null | undefined;\n  tumbon?: string | null | undefined;\n};\n',
  '\nexport type ValidatePromotionInput = {\n  code: string;\n  storeId?: string | null | undefined;\n  subtotal: number;\n};\n',
  '\nexport type AddPaymentMethodInput = {\n  brand: string;\n  expiryMonth: number;\n  expiryYear: number;\n  isDefault?: boolean | null | undefined;\n  lastFour: string;\n  omiseCardToken: string;\n};\n',
  '\nexport type CreateDisputeInput = {\n  issueType: string;\n  orderId: string;\n  reason: string;\n};\n',
  '\nexport type CreateReviewInput = {\n  comment?: string | null | undefined;\n  orderId: string;\n  productId: string;\n  rating: number;\n};\n',
  '\nexport type FavoriteProductInput = {\n  productId: string;\n};\n',
  '\nexport type UpdateProfileInput = {\n  email?: string | null | undefined;\n  fullName?: string | null | undefined;\n};\n',
];

const schemaBlocks = [
  "export type RefreshTokenInput = {\n  refreshToken: Scalars['String']['input'];\n};",
  "export type ReactivateAccountInput = {\n  reactivationToken: Scalars['String']['input'];\n};",
  "export type SendCustomerOtpInput = {\n  phone: Scalars['String']['input'];\n};",
  "export type VerifyCustomerOtpInput = {\n  code: Scalars['String']['input'];\n  phone: Scalars['String']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type AddToCartInput = {\n  quantity: Scalars['Int']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n  variantId: Scalars['String']['input'];\n};",
  "export type RemoveCartItemInput = {\n  itemId: Scalars['String']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type UpdateCartItemInput = {\n  itemId: Scalars['String']['input'];\n  quantity: Scalars['Int']['input'];\n  sessionId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type CreateAddressInput = {\n  addressLine1: Scalars['String']['input'];\n  addressLine2?: InputMaybe<Scalars['String']['input']>;\n  amphoe: Scalars['String']['input'];\n  city?: InputMaybe<Scalars['String']['input']>;\n  isDefault?: InputMaybe<Scalars['Boolean']['input']>;\n  label: Scalars['String']['input'];\n  postalCode: Scalars['String']['input'];\n  province: Scalars['String']['input'];\n  recipientName: Scalars['String']['input'];\n  recipientPhone: Scalars['String']['input'];\n  tumbon?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type CreateOrderInput = {\n  guestEmail?: InputMaybe<Scalars['String']['input']>;\n  guestName?: InputMaybe<Scalars['String']['input']>;\n  guestPhone?: InputMaybe<Scalars['String']['input']>;\n  items: Array<OrderItemInput>;\n  notes?: InputMaybe<Scalars['String']['input']>;\n  paymentMethod: Scalars['String']['input'];\n  platformPromotionCode?: InputMaybe<Scalars['String']['input']>;\n  promotionCode?: InputMaybe<Scalars['String']['input']>;\n  savedAddressId?: InputMaybe<Scalars['String']['input']>;\n  shippingAddress?: InputMaybe<ShippingAddressInput>;\n  storePromotionCodes?: InputMaybe<Array<Scalars['String']['input']>>;\n  storeShipping?: InputMaybe<Array<StoreShippingSelectionInput>>;\n};",
  "export type CreatePaymentInput = {\n  amount: Scalars['Float']['input'];\n  currency?: Scalars['String']['input'];\n  omiseToken?: InputMaybe<Scalars['String']['input']>;\n  orderId: Scalars['String']['input'];\n  paymentMethod: Scalars['String']['input'];\n  savedPaymentMethodId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type OrderItemInput = {\n  price: Scalars['Float']['input'];\n  productId: Scalars['String']['input'];\n  quantity: Scalars['Int']['input'];\n  variantId?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type ShippingAddressInput = {\n  addressLine1: Scalars['String']['input'];\n  addressLine2?: InputMaybe<Scalars['String']['input']>;\n  amphoe: Scalars['String']['input'];\n  city?: InputMaybe<Scalars['String']['input']>;\n  postalCode: Scalars['String']['input'];\n  province: Scalars['String']['input'];\n  recipientName: Scalars['String']['input'];\n  recipientPhone: Scalars['String']['input'];\n  tumbon?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type StoreShippingSelectionInput = {\n  shippingOptionId: Scalars['String']['input'];\n  storeId: Scalars['String']['input'];\n};",
  "export type UpdateAddressInput = {\n  addressLine1?: InputMaybe<Scalars['String']['input']>;\n  addressLine2?: InputMaybe<Scalars['String']['input']>;\n  amphoe?: InputMaybe<Scalars['String']['input']>;\n  city?: InputMaybe<Scalars['String']['input']>;\n  isDefault?: InputMaybe<Scalars['Boolean']['input']>;\n  label?: InputMaybe<Scalars['String']['input']>;\n  postalCode?: InputMaybe<Scalars['String']['input']>;\n  province?: InputMaybe<Scalars['String']['input']>;\n  recipientName?: InputMaybe<Scalars['String']['input']>;\n  recipientPhone?: InputMaybe<Scalars['String']['input']>;\n  tumbon?: InputMaybe<Scalars['String']['input']>;\n};",
  "export type ValidatePromotionInput = {\n  code: Scalars['String']['input'];\n  storeId?: InputMaybe<Scalars['String']['input']>;\n  subtotal: Scalars['Float']['input'];\n};",
  "export type AddPaymentMethodInput = {\n  brand: Scalars['String']['input'];\n  expiryMonth: Scalars['Int']['input'];\n  expiryYear: Scalars['Int']['input'];\n  isDefault?: InputMaybe<Scalars['Boolean']['input']>;\n  lastFour: Scalars['String']['input'];\n  omiseCardToken: Scalars['String']['input'];\n};",
  "export type CreateDisputeInput = {\n  issueType: Scalars['String']['input'];\n  orderId: Scalars['String']['input'];\n  reason: Scalars['String']['input'];\n};",
  "export type CreateReviewInput = {\n  comment?: InputMaybe<Scalars['String']['input']>;\n  orderId: Scalars['String']['input'];\n  productId: Scalars['String']['input'];\n  rating: Scalars['Int']['input'];\n};",
  "export type FavoriteProductInput = {\n  productId: Scalars['String']['input'];\n};",
  "export type UpdateProfileInput = {\n  email?: InputMaybe<Scalars['String']['input']>;\n  fullName?: InputMaybe<Scalars['String']['input']>;\n};",
];

let content = readFileSync(filePath, 'utf8');

for (let index = 0; index < duplicateBlocks.length; index += 1) {
  const duplicateBlock = duplicateBlocks[index];
  const schemaBlock = schemaBlocks[index];

  if (content.includes(schemaBlock) && content.includes(duplicateBlock)) {
    content = content.replace(duplicateBlock, '\n');
  }
}

writeFileSync(filePath, content);
