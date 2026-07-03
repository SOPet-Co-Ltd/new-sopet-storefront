/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AcceptVendorInvitationInput = {
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type AddPaymentMethodInput = {
  brand: Scalars['String']['input'];
  expiryMonth: Scalars['Int']['input'];
  expiryYear: Scalars['Int']['input'];
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  lastFour: Scalars['String']['input'];
  omiseCardToken: Scalars['String']['input'];
};

export type AddProductImageInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  isThumbnail?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  url: Scalars['String']['input'];
};

export type AddToCartInput = {
  quantity: Scalars['Int']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
  variantId: Scalars['String']['input'];
};

export type AdminCustomerConnection = {
  __typename?: 'AdminCustomerConnection';
  items: Array<AdminCustomerType>;
  pagination: PaginationMeta;
};

export type AdminCustomerType = {
  __typename?: 'AdminCustomerType';
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminInvitationType = {
  __typename?: 'AdminInvitationType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AdminStoreType = {
  __typename?: 'AdminStoreType';
  address?: Maybe<Scalars['String']['output']>;
  bankAccountName?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  ownerEmail?: Maybe<Scalars['String']['output']>;
  ownerFullName?: Maybe<Scalars['String']['output']>;
  ownerId: Scalars['String']['output'];
  payoutSchedule: Scalars['String']['output'];
  payoutSchedulePaused: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminTeamMemberType = {
  __typename?: 'AdminTeamMemberType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
};

export type AdminVendorStoreType = {
  __typename?: 'AdminVendorStoreType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type AdminVendorType = {
  __typename?: 'AdminVendorType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  role: Scalars['String']['output'];
  stores: Array<AdminVendorStoreType>;
};

export type ApproveStoreInput = {
  storeId: Scalars['String']['input'];
};

export type AuthTokens = {
  __typename?: 'AuthTokens';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type CartItemType = {
  __typename?: 'CartItemType';
  id: Scalars['String']['output'];
  productVariant?: Maybe<ProductVariantType>;
  quantity: Scalars['Int']['output'];
  variantId: Scalars['String']['output'];
};

export type CartType = {
  __typename?: 'CartType';
  customerId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<CartItemType>;
  sessionId?: Maybe<Scalars['String']['output']>;
};

export type CategoryType = {
  __typename?: 'CategoryType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type CreateAddressInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  amphoe: Scalars['String']['input'];
  city?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  province: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  tumbon?: InputMaybe<Scalars['String']['input']>;
};

export type CreateCategoryInput = {
  name: Scalars['String']['input'];
};

export type CreateDisputeInput = {
  issueType: Scalars['String']['input'];
  orderId: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type CreateOrderInput = {
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  items: Array<OrderItemInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: Scalars['String']['input'];
  platformPromotionCode?: InputMaybe<Scalars['String']['input']>;
  promotionCode?: InputMaybe<Scalars['String']['input']>;
  savedAddressId?: InputMaybe<Scalars['String']['input']>;
  shippingAddress?: InputMaybe<ShippingAddressInput>;
  storePromotionCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  storeShipping?: InputMaybe<Array<StoreShippingSelectionInput>>;
};

export type CreatePaymentInput = {
  amount: Scalars['Float']['input'];
  currency?: Scalars['String']['input'];
  omiseToken?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  paymentMethod: Scalars['String']['input'];
  savedPaymentMethodId?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePayoutInput = {
  amount: Scalars['Float']['input'];
  storeId: Scalars['String']['input'];
};

export type CreatePlatformAdInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePlatformBannerInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePlatformSponsorInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  imageUrl: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateProductInput = {
  basePrice: Scalars['Float']['input'];
  category?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  compareAtPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  warning?: InputMaybe<Scalars['String']['input']>;
};

export type CreateProductVariantInput = {
  /** JSON object of variant attributes (e.g. {"size":"M","color":"Red"}) */
  attributes?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  priceModifier?: InputMaybe<Scalars['Float']['input']>;
  sku: Scalars['String']['input'];
  stockQuantity: Scalars['Int']['input'];
};

export type CreatePromotionInput = {
  autoApply?: InputMaybe<Scalars['Boolean']['input']>;
  code: Scalars['String']['input'];
  conditions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discountValue: Scalars['Float']['input'];
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  minPurchaseAmount?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  priority?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  type: Scalars['String']['input'];
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
  usagePerCustomer?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  rating: Scalars['Int']['input'];
};

export type CreateShippingOptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  providerId?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateShippingProviderInput = {
  name: Scalars['String']['input'];
};

export type CreateStoreApiKeyPayload = {
  __typename?: 'CreateStoreApiKeyPayload';
  apiKey: StoreApiKeyType;
  secret: Scalars['String']['output'];
};

export type CreateStoreAsAdminInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerUserId: Scalars['String']['input'];
};

export type CreateTagInput = {
  name: Scalars['String']['input'];
};

export type CustomerAuthPayload = {
  __typename?: 'CustomerAuthPayload';
  customer?: Maybe<CustomerProfile>;
  pendingDeletion?: Maybe<Scalars['Boolean']['output']>;
  reactivationToken?: Maybe<Scalars['String']['output']>;
  tokens?: Maybe<AuthTokens>;
};

export type CustomerProfile = {
  __typename?: 'CustomerProfile';
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  phone: Scalars['String']['output'];
};

export type DisputeType = {
  __typename?: 'DisputeType';
  id: Scalars['String']['output'];
  issueType: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type FavoriteProductInput = {
  productId: Scalars['String']['input'];
};

export type FavoriteType = {
  __typename?: 'FavoriteType';
  id: Scalars['String']['output'];
  product?: Maybe<ProductType>;
  productId: Scalars['String']['output'];
};

export type HealthStatus = {
  __typename?: 'HealthStatus';
  api: Scalars['String']['output'];
  status: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
};

export type InviteAdminInput = {
  email: Scalars['String']['input'];
};

export type InviteStoreMemberInput = {
  email: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type InviteVendorInput = {
  email: Scalars['String']['input'];
};

export type MeResult = {
  __typename?: 'MeResult';
  customer?: Maybe<CustomerProfile>;
  user?: Maybe<UserProfile>;
};

export type MessagePayload = {
  __typename?: 'MessagePayload';
  message: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptStoreInvitation: StoreMemberType;
  acceptVendorInvitation: VendorAuthPayload;
  addFavorite: FavoriteType;
  addPaymentMethod: SavedPaymentMethodType;
  addProductImage: ProductImageType;
  addToCart: CartType;
  adminCreateStoreShippingOption: StoreShippingOptionType;
  adminDeleteStoreShippingOption: Scalars['Boolean']['output'];
  adminLogin: VendorAuthPayload;
  adminTriggerVendorPasswordReset: MessagePayload;
  adminUpdateStoreShippingOption: StoreShippingOptionType;
  approveCategory: CategoryType;
  approveStore: StoreType;
  approveStoreReactivationRequest: StoreReactivationRequestType;
  approveStoreRequest: StoreRequestType;
  approveTag: TagType;
  changePassword: MessagePayload;
  createAddress: SavedAddressType;
  createCategory: CategoryType;
  createDispute: DisputeType;
  createOrder: OrderType;
  createPayment: PaymentType;
  createPayout: PayoutType;
  createPlatformAd: PlatformAdType;
  createPlatformBanner: PlatformBannerType;
  createPlatformSponsor: PlatformSponsorType;
  createProduct: ProductType;
  createProductVariant: ProductVariantType;
  createPromotion: PromotionType;
  createReview: ReviewType;
  createShippingOption: StoreShippingOptionType;
  createShippingProvider: ShippingProviderType;
  createStoreApiKey: CreateStoreApiKeyPayload;
  createStoreAsAdmin: AdminStoreType;
  createTag: TagType;
  declineStoreInvitation: Scalars['Boolean']['output'];
  deleteAddress: Scalars['Boolean']['output'];
  deletePaymentMethod: Scalars['Boolean']['output'];
  deletePlatformAd: Scalars['Boolean']['output'];
  deletePlatformBanner: Scalars['Boolean']['output'];
  deletePlatformSponsor: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteProductImage: Scalars['Boolean']['output'];
  deleteProductVariant: Scalars['Boolean']['output'];
  deletePromotion: Scalars['Boolean']['output'];
  deleteShippingOption: Scalars['Boolean']['output'];
  deleteShippingProvider: Scalars['Boolean']['output'];
  inviteAdmin: AdminInvitationType;
  inviteStoreMember: StoreMemberInvitationType;
  inviteVendor: VendorInvitationType;
  markAllNotificationsRead: Scalars['Boolean']['output'];
  markNotificationRead: Scalars['Boolean']['output'];
  mergeCart: CartType;
  publishProduct: ProductType;
  reactivateAccount: CustomerAuthPayload;
  refreshToken: AuthTokens;
  refundPayment: PaymentType;
  registerStore: VendorAuthPayload;
  registerVendor: VendorAuthPayload;
  rejectCategory: CategoryType;
  rejectStore: StoreType;
  rejectStoreReactivationRequest: StoreReactivationRequestType;
  rejectStoreRequest: StoreRequestType;
  rejectTag: TagType;
  removeCartItem: CartType;
  removeFavorite: Scalars['Boolean']['output'];
  removeStoreMember: Scalars['Boolean']['output'];
  reorderPlatformBanners: Array<PlatformBannerType>;
  reorderPlatformSponsors: Array<PlatformSponsorType>;
  reorderProductImages: Array<ProductImageType>;
  requestAccountDeletion: Scalars['Boolean']['output'];
  requestPasswordReset: MessagePayload;
  resetPassword: MessagePayload;
  revokeAdminInvitation: AdminInvitationType;
  revokeStoreApiKey: Scalars['Boolean']['output'];
  revokeStoreInvitation: StoreMemberInvitationType;
  sendCustomerOtp: MessagePayload;
  setAdminActive: AdminTeamMemberType;
  setCustomerActive: AdminCustomerType;
  setDefaultAddress: SavedAddressType;
  setDefaultPaymentMethod: SavedPaymentMethodType;
  setProductThumbnail: ProductImageType;
  submitStoreReactivationRequest: StoreReactivationRequestType;
  submitStoreRequest: StoreRequestType;
  switchStore: VendorAuthPayload;
  syncProductVariants: Array<ProductVariantType>;
  togglePromotion: PromotionType;
  updateAddress: SavedAddressType;
  updateCartItem: CartType;
  updateCustomerAsAdmin: AdminCustomerType;
  updateOrderStatus: OrderType;
  updatePlatformAd: PlatformAdType;
  updatePlatformBanner: PlatformBannerType;
  updatePlatformSponsor: PlatformSponsorType;
  updateProduct: ProductType;
  updateProductImage: ProductImageType;
  updateProductVariant: ProductVariantType;
  updateProfile: CustomerProfile;
  updatePromotion: PromotionType;
  updateShippingOption: StoreShippingOptionType;
  updateShippingProvider: ShippingProviderType;
  updateStore: MyStoreType;
  updateStoreAsAdmin: AdminStoreType;
  updateStoreMemberRole: StoreMemberType;
  updateStorePayout: MyStoreType;
  updateUserProfile: UserProfile;
  updateVendorAsAdmin: AdminVendorType;
  uploadImage: UploadResultType;
  vendorLogin: VendorAuthPayload;
  verifyCustomerOtp: CustomerAuthPayload;
};


export type MutationAcceptStoreInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationAcceptVendorInvitationArgs = {
  input: AcceptVendorInvitationInput;
};


export type MutationAddFavoriteArgs = {
  input: FavoriteProductInput;
};


export type MutationAddPaymentMethodArgs = {
  input: AddPaymentMethodInput;
};


export type MutationAddProductImageArgs = {
  input: AddProductImageInput;
  productId: Scalars['String']['input'];
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationAdminCreateStoreShippingOptionArgs = {
  input: CreateShippingOptionInput;
  storeId: Scalars['String']['input'];
};


export type MutationAdminDeleteStoreShippingOptionArgs = {
  id: Scalars['String']['input'];
};


export type MutationAdminLoginArgs = {
  input: VendorLoginInput;
};


export type MutationAdminTriggerVendorPasswordResetArgs = {
  vendorId: Scalars['String']['input'];
};


export type MutationAdminUpdateStoreShippingOptionArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingOptionInput;
};


export type MutationApproveCategoryArgs = {
  id: Scalars['String']['input'];
};


export type MutationApproveStoreArgs = {
  input: ApproveStoreInput;
};


export type MutationApproveStoreReactivationRequestArgs = {
  id: Scalars['String']['input'];
};


export type MutationApproveStoreRequestArgs = {
  id: Scalars['String']['input'];
};


export type MutationApproveTagArgs = {
  id: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateAddressArgs = {
  input: CreateAddressInput;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateDisputeArgs = {
  input: CreateDisputeInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreatePaymentArgs = {
  input: CreatePaymentInput;
};


export type MutationCreatePayoutArgs = {
  input: CreatePayoutInput;
};


export type MutationCreatePlatformAdArgs = {
  input: CreatePlatformAdInput;
};


export type MutationCreatePlatformBannerArgs = {
  input: CreatePlatformBannerInput;
};


export type MutationCreatePlatformSponsorArgs = {
  input: CreatePlatformSponsorInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateProductVariantArgs = {
  input: CreateProductVariantInput;
  productId: Scalars['String']['input'];
};


export type MutationCreatePromotionArgs = {
  input: CreatePromotionInput;
};


export type MutationCreateReviewArgs = {
  input: CreateReviewInput;
};


export type MutationCreateShippingOptionArgs = {
  input: CreateShippingOptionInput;
};


export type MutationCreateShippingProviderArgs = {
  input: CreateShippingProviderInput;
};


export type MutationCreateStoreApiKeyArgs = {
  name: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type MutationCreateStoreAsAdminArgs = {
  input: CreateStoreAsAdminInput;
};


export type MutationCreateTagArgs = {
  input: CreateTagInput;
};


export type MutationDeclineStoreInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationDeleteAddressArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeletePaymentMethodArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeletePlatformAdArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeletePlatformBannerArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeletePlatformSponsorArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteProductImageArgs = {
  imageId: Scalars['String']['input'];
};


export type MutationDeleteProductVariantArgs = {
  variantId: Scalars['String']['input'];
};


export type MutationDeletePromotionArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteShippingOptionArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteShippingProviderArgs = {
  id: Scalars['String']['input'];
};


export type MutationInviteAdminArgs = {
  input: InviteAdminInput;
};


export type MutationInviteStoreMemberArgs = {
  input: InviteStoreMemberInput;
};


export type MutationInviteVendorArgs = {
  input: InviteVendorInput;
};


export type MutationMarkNotificationReadArgs = {
  id: Scalars['String']['input'];
};


export type MutationMergeCartArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationPublishProductArgs = {
  id: Scalars['String']['input'];
};


export type MutationReactivateAccountArgs = {
  input: ReactivateAccountInput;
};


export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput;
};


export type MutationRefundPaymentArgs = {
  paymentId: Scalars['String']['input'];
};


export type MutationRegisterStoreArgs = {
  input: RegisterStoreInput;
};


export type MutationRegisterVendorArgs = {
  input: RegisterVendorInput;
};


export type MutationRejectCategoryArgs = {
  id: Scalars['String']['input'];
};


export type MutationRejectStoreArgs = {
  input: RejectStoreInput;
};


export type MutationRejectStoreReactivationRequestArgs = {
  input: RejectStoreReactivationRequestInput;
};


export type MutationRejectStoreRequestArgs = {
  input: RejectStoreRequestInput;
};


export type MutationRejectTagArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemoveCartItemArgs = {
  input: RemoveCartItemInput;
};


export type MutationRemoveFavoriteArgs = {
  input: FavoriteProductInput;
};


export type MutationRemoveStoreMemberArgs = {
  memberId: Scalars['String']['input'];
};


export type MutationReorderPlatformBannersArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationReorderPlatformSponsorsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationReorderProductImagesArgs = {
  imageIds: Array<Scalars['ID']['input']>;
  productId: Scalars['String']['input'];
};


export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationRevokeAdminInvitationArgs = {
  invitationId: Scalars['String']['input'];
};


export type MutationRevokeStoreApiKeyArgs = {
  id: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type MutationRevokeStoreInvitationArgs = {
  invitationId: Scalars['String']['input'];
};


export type MutationSendCustomerOtpArgs = {
  input: SendCustomerOtpInput;
};


export type MutationSetAdminActiveArgs = {
  isActive: Scalars['Boolean']['input'];
  userId: Scalars['String']['input'];
};


export type MutationSetCustomerActiveArgs = {
  id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationSetDefaultAddressArgs = {
  id: Scalars['String']['input'];
};


export type MutationSetDefaultPaymentMethodArgs = {
  id: Scalars['String']['input'];
};


export type MutationSetProductThumbnailArgs = {
  imageId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};


export type MutationSubmitStoreReactivationRequestArgs = {
  input: SubmitStoreReactivationRequestInput;
};


export type MutationSubmitStoreRequestArgs = {
  input: SubmitStoreRequestInput;
};


export type MutationSwitchStoreArgs = {
  input: SwitchStoreInput;
};


export type MutationSyncProductVariantsArgs = {
  productId: Scalars['String']['input'];
  variants: Array<SyncProductVariantItemInput>;
};


export type MutationTogglePromotionArgs = {
  id: Scalars['String']['input'];
  isActive: Scalars['Boolean']['input'];
};


export type MutationUpdateAddressArgs = {
  id: Scalars['String']['input'];
  input: UpdateAddressInput;
};


export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};


export type MutationUpdateCustomerAsAdminArgs = {
  input: UpdateCustomerAsAdminInput;
};


export type MutationUpdateOrderStatusArgs = {
  input: UpdateOrderStatusInput;
};


export type MutationUpdatePlatformAdArgs = {
  input: UpdatePlatformAdInput;
};


export type MutationUpdatePlatformBannerArgs = {
  input: UpdatePlatformBannerInput;
};


export type MutationUpdatePlatformSponsorArgs = {
  input: UpdatePlatformSponsorInput;
};


export type MutationUpdateProductArgs = {
  id: Scalars['String']['input'];
  input: UpdateProductInput;
};


export type MutationUpdateProductImageArgs = {
  imageId: Scalars['String']['input'];
  input: UpdateProductImageInput;
};


export type MutationUpdateProductVariantArgs = {
  input: UpdateProductVariantInput;
  variantId: Scalars['String']['input'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdatePromotionArgs = {
  id: Scalars['String']['input'];
  input: UpdatePromotionInput;
};


export type MutationUpdateShippingOptionArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingOptionInput;
};


export type MutationUpdateShippingProviderArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingProviderInput;
};


export type MutationUpdateStoreArgs = {
  input: UpdateStoreSettingsInput;
};


export type MutationUpdateStoreAsAdminArgs = {
  input: UpdateStoreAsAdminInput;
};


export type MutationUpdateStoreMemberRoleArgs = {
  input: UpdateStoreMemberRoleInput;
};


export type MutationUpdateStorePayoutArgs = {
  input: UpdateStorePayoutInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUpdateVendorAsAdminArgs = {
  input: UpdateVendorAsAdminInput;
};


export type MutationUploadImageArgs = {
  base64: Scalars['String']['input'];
  folder?: InputMaybe<Scalars['String']['input']>;
};


export type MutationVendorLoginArgs = {
  input: VendorLoginInput;
};


export type MutationVerifyCustomerOtpArgs = {
  input: VerifyCustomerOtpInput;
};

export type MyStoreType = {
  __typename?: 'MyStoreType';
  address?: Maybe<Scalars['String']['output']>;
  bankAccountName?: Maybe<Scalars['String']['output']>;
  bankAccountNumber?: Maybe<Scalars['String']['output']>;
  bankCode?: Maybe<Scalars['String']['output']>;
  bankName?: Maybe<Scalars['String']['output']>;
  bannerUrl?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  omiseRecipientFailureMessage?: Maybe<Scalars['String']['output']>;
  omiseRecipientId?: Maybe<Scalars['String']['output']>;
  omiseRecipientStatus: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type NotificationType = {
  __typename?: 'NotificationType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  metadata: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type OrderItemInput = {
  price: Scalars['Float']['input'];
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  variantId?: InputMaybe<Scalars['String']['input']>;
};

export type OrderItemType = {
  __typename?: 'OrderItemType';
  fulfillmentStatus: Scalars['String']['output'];
  id: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type OrderShippingAddressType = {
  __typename?: 'OrderShippingAddressType';
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  amphoe: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  province: Scalars['String']['output'];
  tumbon?: Maybe<Scalars['String']['output']>;
};

export type OrderType = {
  __typename?: 'OrderType';
  discountAmount: Scalars['Float']['output'];
  guestEmail?: Maybe<Scalars['String']['output']>;
  guestName?: Maybe<Scalars['String']['output']>;
  guestPhone?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<OrderItemType>;
  orderNumber: Scalars['String']['output'];
  paymentMethod: Scalars['String']['output'];
  shippingAddress?: Maybe<OrderShippingAddressType>;
  shippingFee: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
};

export type PaginationMeta = {
  __typename?: 'PaginationMeta';
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaymentType = {
  __typename?: 'PaymentType';
  amount: Scalars['Float']['output'];
  authorizeUri?: Maybe<Scalars['String']['output']>;
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  paymentMethod: Scalars['String']['output'];
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type PayoutType = {
  __typename?: 'PayoutType';
  amount: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  netAmount: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
};

export type PlatformAdType = {
  __typename?: 'PlatformAdType';
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
};

export type PlatformAnalyticsType = {
  __typename?: 'PlatformAnalyticsType';
  averageOrderValue: Scalars['Float']['output'];
  openDisputes: Scalars['Int']['output'];
  pendingStores: Scalars['Int']['output'];
  totalCustomers: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
  totalStores: Scalars['Int']['output'];
};

export type PlatformBannerType = {
  __typename?: 'PlatformBannerType';
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  title: Scalars['String']['output'];
};

export type PlatformSettingsType = {
  __typename?: 'PlatformSettingsType';
  currency: Scalars['String']['output'];
  storefrontUrl: Scalars['String']['output'];
  supportEmail: Scalars['String']['output'];
};

export type PlatformSponsorType = {
  __typename?: 'PlatformSponsorType';
  endsAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  linkUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ProductConnection = {
  __typename?: 'ProductConnection';
  items: Array<ProductType>;
  pagination: PaginationMeta;
};

export type ProductImageType = {
  __typename?: 'ProductImageType';
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  isThumbnail: Scalars['Boolean']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type ProductPublishChecklistItemType = {
  __typename?: 'ProductPublishChecklistItemType';
  complete: Scalars['Boolean']['output'];
  key: Scalars['String']['output'];
};

export type ProductPublishChecklistType = {
  __typename?: 'ProductPublishChecklistType';
  canPublish: Scalars['Boolean']['output'];
  items: Array<ProductPublishChecklistItemType>;
  missingKeys: Array<Scalars['String']['output']>;
};

export type ProductReviewBreakdownType = {
  __typename?: 'ProductReviewBreakdownType';
  averageRating: Scalars['Float']['output'];
  productId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  reviewCount: Scalars['Int']['output'];
};

export type ProductType = {
  __typename?: 'ProductType';
  averageRating: Scalars['Float']['output'];
  basePrice: Scalars['Float']['output'];
  category?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['String']['output']>;
  compareAtPrice?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  images?: Maybe<Array<ProductImageType>>;
  name: Scalars['String']['output'];
  reviewCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  soldCount: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  store?: Maybe<StoreType>;
  storeId: Scalars['String']['output'];
  tagIds?: Maybe<Array<Scalars['String']['output']>>;
  tags: Array<Scalars['String']['output']>;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  variants?: Maybe<Array<ProductVariantType>>;
  warning?: Maybe<Scalars['String']['output']>;
};

export type ProductVariantType = {
  __typename?: 'ProductVariantType';
  id: Scalars['String']['output'];
  optionsJson?: Maybe<Scalars['String']['output']>;
  price: Scalars['Float']['output'];
  sku: Scalars['String']['output'];
  stockQuantity: Scalars['Int']['output'];
};

export type PromotionType = {
  __typename?: 'PromotionType';
  autoApply: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  conditions?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  discountValue: Scalars['Float']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  maxDiscountAmount?: Maybe<Scalars['Float']['output']>;
  minPurchaseAmount?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
  scope: Scalars['String']['output'];
  startsAt?: Maybe<Scalars['DateTime']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  usageCount: Scalars['Int']['output'];
  usageLimit?: Maybe<Scalars['Int']['output']>;
  usagePerCustomer: Scalars['Int']['output'];
};

export type PromotionValidationResult = {
  __typename?: 'PromotionValidationResult';
  code: Scalars['String']['output'];
  discountAmount: Scalars['Float']['output'];
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  addresses: Array<SavedAddressType>;
  adminCustomer: AdminCustomerType;
  adminCustomers: AdminCustomerConnection;
  adminStore: AdminStoreType;
  adminStoreReactivationRequests: Array<StoreReactivationRequestType>;
  adminStoreShippingOptions: Array<StoreShippingOptionType>;
  adminStores: Array<AdminStoreType>;
  adminTeamMembers: Array<AdminTeamMemberType>;
  adminVendor: AdminVendorType;
  adminVendors: Array<AdminVendorType>;
  allPlatformAds: Array<PlatformAdType>;
  allPlatformBanners: Array<PlatformBannerType>;
  allPlatformSponsors: Array<PlatformSponsorType>;
  approvedCategories: Array<CategoryType>;
  approvedTags: Array<TagType>;
  cart: CartType;
  favorites: Array<FavoriteType>;
  guestOrders: Array<OrderType>;
  /** GraphQL API health check */
  health: HealthStatus;
  latestPurchaseProduct?: Maybe<ProductType>;
  latestPurchaseProducts: Array<ProductType>;
  me: MeResult;
  myCategoryProposals: Array<CategoryType>;
  myDisputes: Array<DisputeType>;
  myStore: MyStoreType;
  myStoreRequests: Array<StoreRequestType>;
  myStoreShippingOptions: Array<StoreShippingOptionType>;
  myStores: Array<VendorStoreType>;
  myTagProposals: Array<TagType>;
  notifications: Array<NotificationType>;
  openDisputes: Array<DisputeType>;
  order: OrderType;
  orders: Array<OrderType>;
  paymentMethods: Array<SavedPaymentMethodType>;
  pendingAdminInvitations: Array<AdminInvitationType>;
  pendingCategories: Array<CategoryType>;
  pendingStoreRequests: Array<StoreRequestType>;
  pendingStores: Array<StoreType>;
  pendingTags: Array<TagType>;
  pendingVendorInvitations: Array<VendorInvitationType>;
  platformAds: Array<PlatformAdType>;
  platformAnalytics: PlatformAnalyticsType;
  platformBanners: Array<PlatformBannerType>;
  platformPromotions: Array<PromotionType>;
  platformSalesByCategory: Array<SalesBreakdownItemType>;
  platformSalesByPaymentMethod: Array<SalesBreakdownItemType>;
  platformSalesOverTime: Array<SalesTimePointType>;
  platformSettings: PlatformSettingsType;
  platformSponsors: Array<PlatformSponsorType>;
  platformTopProducts: Array<TopProductType>;
  platformTopStores: Array<TopStoreType>;
  product: ProductType;
  productBySlug: ProductType;
  productPublishChecklist: ProductPublishChecklistType;
  productReviews: Array<ReviewType>;
  products: ProductConnection;
  recommendedProducts: Array<ProductType>;
  shippingProviders: Array<ShippingProviderType>;
  store: StoreType;
  storeAnalytics: StoreAnalyticsType;
  storeApiKeys: Array<StoreApiKeyType>;
  storeBySlug: StoreType;
  storeInvitations: Array<StoreMemberInvitationType>;
  storeMembers: Array<StoreMemberType>;
  storePayouts: Array<PayoutType>;
  storeProductReviews: Array<StoreProductReviewType>;
  storePromotions: Array<PromotionType>;
  storeReactivationRequests: Array<StoreReactivationRequestType>;
  storeReviewSummary: StoreReviewSummaryType;
  storeShippingOptions: Array<StoreShippingOptionType>;
  stores: Array<StoreType>;
  topProducts: Array<TopProductType>;
  validatePromotion: PromotionValidationResult;
  vendorCustomer: VendorCustomerType;
  vendorCustomers: VendorCustomerConnection;
  vendorOrders: Array<OrderType>;
  vendorProduct: ProductType;
  vendorProducts: ProductConnection;
};


export type QueryAdminCustomerArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminCustomersArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminStoreArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminStoreReactivationRequestsArgs = {
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAdminStoreShippingOptionsArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryAdminVendorArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminVendorsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCartArgs = {
  sessionId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGuestOrdersArgs = {
  guestPhone: Scalars['String']['input'];
};


export type QueryLatestPurchaseProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryNotificationsArgs = {
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryPlatformAnalyticsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlatformSalesByCategoryArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlatformSalesByPaymentMethodArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlatformSalesOverTimeArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPlatformTopProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPlatformTopStoresArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  id: Scalars['String']['input'];
};


export type QueryProductBySlugArgs = {
  slug: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};


export type QueryProductPublishChecklistArgs = {
  productId: Scalars['String']['input'];
};


export type QueryProductReviewsArgs = {
  productId: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};


export type QueryRecommendedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryShippingProvidersArgs = {
  includeInactive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryStoreArgs = {
  id: Scalars['String']['input'];
};


export type QueryStoreAnalyticsArgs = {
  fromDate?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
  toDate?: InputMaybe<Scalars['String']['input']>;
};


export type QueryStoreApiKeysArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryStoreBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryStoreProductReviewsArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryStorePromotionsArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryStoreReactivationRequestsArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryStoreReviewSummaryArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryStoreShippingOptionsArgs = {
  storeId: Scalars['String']['input'];
};


export type QueryTopProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  storeId: Scalars['String']['input'];
};


export type QueryValidatePromotionArgs = {
  input: ValidatePromotionInput;
};


export type QueryVendorCustomerArgs = {
  id: Scalars['String']['input'];
};


export type QueryVendorCustomersArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVendorProductArgs = {
  id: Scalars['String']['input'];
};


export type QueryVendorProductsArgs = {
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type ReactivateAccountInput = {
  reactivationToken: Scalars['String']['input'];
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterStoreInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bankAccountName?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  ownerEmail: Scalars['String']['input'];
  ownerFullName: Scalars['String']['input'];
  ownerPassword: Scalars['String']['input'];
};

export type RegisterVendorInput = {
  email: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type RejectStoreInput = {
  rejectionReason?: InputMaybe<Scalars['String']['input']>;
  storeId: Scalars['String']['input'];
};

export type RejectStoreReactivationRequestInput = {
  id: Scalars['String']['input'];
  reviewNote?: InputMaybe<Scalars['String']['input']>;
};

export type RejectStoreRequestInput = {
  id: Scalars['String']['input'];
  reason: Scalars['String']['input'];
};

export type RemoveCartItemInput = {
  itemId: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type ReviewType = {
  __typename?: 'ReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type SalesBreakdownItemType = {
  __typename?: 'SalesBreakdownItemType';
  label: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type SalesTimePointType = {
  __typename?: 'SalesTimePointType';
  date: Scalars['String']['output'];
  orderCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
};

export type SavedAddressType = {
  __typename?: 'SavedAddressType';
  addressLine1: Scalars['String']['output'];
  addressLine2?: Maybe<Scalars['String']['output']>;
  amphoe: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  label?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  province: Scalars['String']['output'];
  tumbon?: Maybe<Scalars['String']['output']>;
};

export type SavedPaymentMethodType = {
  __typename?: 'SavedPaymentMethodType';
  brand: Scalars['String']['output'];
  expiryMonth: Scalars['Int']['output'];
  expiryYear: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  isDefault: Scalars['Boolean']['output'];
  lastFour: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SendCustomerOtpInput = {
  phone: Scalars['String']['input'];
};

export type ShippingAddressInput = {
  addressLine1: Scalars['String']['input'];
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  amphoe: Scalars['String']['input'];
  city?: InputMaybe<Scalars['String']['input']>;
  postalCode: Scalars['String']['input'];
  province: Scalars['String']['input'];
  recipientName: Scalars['String']['input'];
  recipientPhone: Scalars['String']['input'];
  tumbon?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingProviderType = {
  __typename?: 'ShippingProviderType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StoreAnalyticsType = {
  __typename?: 'StoreAnalyticsType';
  pendingOrders: Scalars['Int']['output'];
  recentOrders: Scalars['Int']['output'];
  totalOrders: Scalars['Int']['output'];
  totalProducts: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type StoreApiKeyType = {
  __typename?: 'StoreApiKeyType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  keyPrefix: Scalars['String']['output'];
  lastUsedAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type StoreMemberInvitationType = {
  __typename?: 'StoreMemberInvitationType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
};

export type StoreMemberType = {
  __typename?: 'StoreMemberType';
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type StoreProductReviewType = {
  __typename?: 'StoreProductReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
};

export type StoreReactivationRequestImageType = {
  __typename?: 'StoreReactivationRequestImageType';
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  sortOrder: Scalars['Int']['output'];
};

export type StoreReactivationRequestType = {
  __typename?: 'StoreReactivationRequestType';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  images: Array<StoreReactivationRequestImageType>;
  reviewNote?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  submittedByEmail?: Maybe<Scalars['String']['output']>;
  submittedByFullName?: Maybe<Scalars['String']['output']>;
  submittedByUserId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StoreRequestType = {
  __typename?: 'StoreRequestType';
  address?: Maybe<Scalars['String']['output']>;
  contactEmail?: Maybe<Scalars['String']['output']>;
  contactPhone?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdStoreId?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  rejectionReason?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  vendorUserId: Scalars['String']['output'];
};

export type StoreReviewSummaryType = {
  __typename?: 'StoreReviewSummaryType';
  averageRating: Scalars['Float']['output'];
  productBreakdown: Array<ProductReviewBreakdownType>;
  totalCount: Scalars['Int']['output'];
};

export type StoreShippingOptionType = {
  __typename?: 'StoreShippingOptionType';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  providerId?: Maybe<Scalars['String']['output']>;
  sortOrder: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
};

export type StoreShippingSelectionInput = {
  shippingOptionId: Scalars['String']['input'];
  storeId: Scalars['String']['input'];
};

export type StoreType = {
  __typename?: 'StoreType';
  bannerUrl?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type SubmitStoreReactivationRequestInput = {
  content: Scalars['String']['input'];
  mediaUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  storeId: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type SubmitStoreRequestInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  storeName: Scalars['String']['input'];
};

export type SwitchStoreInput = {
  storeId: Scalars['String']['input'];
};

export type SyncProductVariantItemInput = {
  /** JSON object of variant options (e.g. {"color":"red","size":"M"}) */
  attributes: Scalars['String']['input'];
  id?: InputMaybe<Scalars['String']['input']>;
  priceModifier?: InputMaybe<Scalars['Float']['input']>;
  sku: Scalars['String']['input'];
  stockQuantity: Scalars['Int']['input'];
};

export type TagType = {
  __typename?: 'TagType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TopProductType = {
  __typename?: 'TopProductType';
  name: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  revenue: Scalars['Float']['output'];
  unitsSold: Scalars['Int']['output'];
};

export type TopStoreType = {
  __typename?: 'TopStoreType';
  orderCount: Scalars['Int']['output'];
  revenue: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
};

export type UpdateAddressInput = {
  addressLine1?: InputMaybe<Scalars['String']['input']>;
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  amphoe?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  isDefault?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  province?: InputMaybe<Scalars['String']['input']>;
  recipientName?: InputMaybe<Scalars['String']['input']>;
  recipientPhone?: InputMaybe<Scalars['String']['input']>;
  tumbon?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCartItemInput = {
  itemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCustomerAsAdminInput = {
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderStatusInput = {
  orderId: Scalars['String']['input'];
  status: Scalars['String']['input'];
};

export type UpdatePlatformAdInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlatformBannerInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePlatformSponsorInput = {
  endsAt?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  linkUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
};

export type UpdateProductImageInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  isThumbnail?: InputMaybe<Scalars['Boolean']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProductInput = {
  basePrice?: InputMaybe<Scalars['Float']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  compareAtPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  warning?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductVariantInput = {
  /** JSON object of variant attributes (e.g. {"size":"M","color":"Red"}) */
  attributes?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priceModifier?: InputMaybe<Scalars['Float']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePromotionInput = {
  autoApply?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  conditions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discountValue?: InputMaybe<Scalars['Float']['input']>;
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  maxDiscountAmount?: InputMaybe<Scalars['Float']['input']>;
  minPurchaseAmount?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  priority?: InputMaybe<Scalars['Int']['input']>;
  startsAt?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  usageLimit?: InputMaybe<Scalars['Int']['input']>;
  usagePerCustomer?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShippingOptionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  providerId?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShippingProviderInput = {
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreAsAdminInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  ownerId?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreMemberRoleInput = {
  memberId: Scalars['String']['input'];
  role: Scalars['String']['input'];
};

export type UpdateStorePayoutInput = {
  bankAccountName?: InputMaybe<Scalars['String']['input']>;
  bankAccountNumber?: InputMaybe<Scalars['String']['input']>;
  bankCode?: InputMaybe<Scalars['String']['input']>;
  bankName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateStoreSettingsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  bannerUrl?: InputMaybe<Scalars['String']['input']>;
  contactEmail?: InputMaybe<Scalars['String']['input']>;
  contactPhone?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserProfileInput = {
  fullName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateVendorAsAdminInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UploadResultType = {
  __typename?: 'UploadResultType';
  key: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type UserProfile = {
  __typename?: 'UserProfile';
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  role: Scalars['String']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
};

export type ValidatePromotionInput = {
  code: Scalars['String']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
  subtotal: Scalars['Float']['input'];
};

export type VendorAuthPayload = {
  __typename?: 'VendorAuthPayload';
  tokens: AuthTokens;
  user: UserProfile;
};

export type VendorCustomerConnection = {
  __typename?: 'VendorCustomerConnection';
  items: Array<VendorCustomerType>;
  pagination: PaginationMeta;
};

export type VendorCustomerType = {
  __typename?: 'VendorCustomerType';
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone: Scalars['String']['output'];
};

export type VendorInvitationType = {
  __typename?: 'VendorInvitationType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  status: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type VendorLoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type VendorStoreType = {
  __typename?: 'VendorStoreType';
  membershipRole: Scalars['String']['output'];
  store: StoreType;
};

export type VerifyCustomerOtpInput = {
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { health: { status: string, api: string, timestamp: string } };


export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"api"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;