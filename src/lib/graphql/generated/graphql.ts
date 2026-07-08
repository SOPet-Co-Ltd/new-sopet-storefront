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
  imageUrl?: Maybe<Scalars['String']['output']>;
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
  imageUrl?: InputMaybe<Scalars['String']['input']>;
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
  mobileImageUrl?: InputMaybe<Scalars['String']['input']>;
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

export type DisputeImageType = {
  __typename?: 'DisputeImageType';
  id: Scalars['String']['output'];
  imageUrl: Scalars['String']['output'];
  sortOrder: Scalars['Float']['output'];
};

export type DisputeMessageType = {
  __typename?: 'DisputeMessageType';
  attachments: Array<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  senderType: Scalars['String']['output'];
};

export type DisputeType = {
  __typename?: 'DisputeType';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  images: Array<DisputeImageType>;
  issueType: Scalars['String']['output'];
  messages: Array<DisputeMessageType>;
  orderId: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  setCategoryImage: CategoryType;
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
  updateCategory: CategoryType;
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


export type MutationSetCategoryImageArgs = {
  input: SetCategoryImageInput;
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


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
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
  metadata?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
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
  variantId: Scalars['String']['output'];
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

export type OrderStoreShippingType = {
  __typename?: 'OrderStoreShippingType';
  optionName: Scalars['String']['output'];
  shippingFee: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
};

export type OrderType = {
  __typename?: 'OrderType';
  createdAt: Scalars['DateTime']['output'];
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
  storeShippings: Array<OrderStoreShippingType>;
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
  mobileImageUrl?: Maybe<Scalars['String']['output']>;
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
  product?: Maybe<ProductType>;
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
  activePlatformPromotions: Array<PromotionType>;
  activeStorePromotions: Array<PromotionType>;
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
  payment: PaymentType;
  paymentByOrderId: PaymentType;
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
  unreadNotificationsCount: Scalars['Int']['output'];
  validatePromotion: PromotionValidationResult;
  vendorCustomer: VendorCustomerType;
  vendorCustomers: VendorCustomerConnection;
  vendorOrders: Array<OrderType>;
  vendorProduct: ProductType;
  vendorProducts: ProductConnection;
};


export type QueryActiveStorePromotionsArgs = {
  storeId: Scalars['String']['input'];
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


export type QueryPaymentArgs = {
  id: Scalars['String']['input'];
};


export type QueryPaymentByOrderIdArgs = {
  orderId: Scalars['String']['input'];
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

export type ReviewImageType = {
  __typename?: 'ReviewImageType';
  id: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type ReviewType = {
  __typename?: 'ReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  images: Array<ReviewImageType>;
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

export type SetCategoryImageInput = {
  categoryId: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
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

export type UpdateCategoryInput = {
  categoryId: Scalars['String']['input'];
  name: Scalars['String']['input'];
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
  mobileImageUrl?: InputMaybe<Scalars['String']['input']>;
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





















export type RequestAccountDeletionMutationVariables = Exact<{ [key: string]: never; }>;


export type RequestAccountDeletionMutation = { requestAccountDeletion: boolean };

export type SavedAddressFieldsFragment = { id: string, fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string, label: string | null, isDefault: boolean };

export type AddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type AddressesQuery = { addresses: Array<{ id: string, fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string, label: string | null, isDefault: boolean }> };

export type CreateAddressMutationVariables = Exact<{
  input: CreateAddressInput;
}>;


export type CreateAddressMutation = { createAddress: { id: string, fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string, label: string | null, isDefault: boolean } };

export type UpdateAddressMutationVariables = Exact<{
  id: string;
  input: UpdateAddressInput;
}>;


export type UpdateAddressMutation = { updateAddress: { id: string, fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string, label: string | null, isDefault: boolean } };

export type DeleteAddressMutationVariables = Exact<{
  id: string;
}>;


export type DeleteAddressMutation = { deleteAddress: boolean };

export type SetDefaultAddressMutationVariables = Exact<{
  id: string;
}>;


export type SetDefaultAddressMutation = { setDefaultAddress: { id: string, fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string, label: string | null, isDefault: boolean } };

export type RefreshTokenMutationVariables = Exact<{
  input: RefreshTokenInput;
}>;


export type RefreshTokenMutation = { refreshToken: { accessToken: string, refreshToken: string } };

export type SendCustomerOtpMutationVariables = Exact<{
  input: SendCustomerOtpInput;
}>;


export type SendCustomerOtpMutation = { sendCustomerOtp: { message: string } };

export type VerifyCustomerOtpMutationVariables = Exact<{
  input: VerifyCustomerOtpInput;
}>;


export type VerifyCustomerOtpMutation = { verifyCustomerOtp: { pendingDeletion: boolean | null, reactivationToken: string | null, customer: { id: string, phone: string, email: string | null, fullName: string | null } | null, tokens: { accessToken: string, refreshToken: string } | null } };

export type ReactivateAccountMutationVariables = Exact<{
  input: ReactivateAccountInput;
}>;


export type ReactivateAccountMutation = { reactivateAccount: { pendingDeletion: boolean | null, customer: { id: string, phone: string, email: string | null, fullName: string | null } | null, tokens: { accessToken: string, refreshToken: string } | null } };

export type CartItemFieldsFragment = { id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null };

export type CartFieldsFragment = { id: string, sessionId: string | null, customerId: string | null, items: Array<{ id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null }> };

export type CartQueryVariables = Exact<{
  sessionId?: string | null | undefined;
}>;


export type CartQuery = { cart: { id: string, sessionId: string | null, customerId: string | null, items: Array<{ id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null }> } };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { addToCart: { id: string, sessionId: string | null, customerId: string | null, items: Array<{ id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null }> } };

export type UpdateCartItemMutationVariables = Exact<{
  input: UpdateCartItemInput;
}>;


export type UpdateCartItemMutation = { updateCartItem: { id: string, sessionId: string | null, customerId: string | null, items: Array<{ id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null }> } };

export type RemoveCartItemMutationVariables = Exact<{
  input: RemoveCartItemInput;
}>;


export type RemoveCartItemMutation = { removeCartItem: { id: string, sessionId: string | null, customerId: string | null, items: Array<{ id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null }> } };

export type MergeCartMutationVariables = Exact<{
  sessionId: string;
}>;


export type MergeCartMutation = { mergeCart: { id: string, sessionId: string | null, customerId: string | null, items: Array<{ id: string, quantity: number, variantId: string, productVariant: { id: string, price: number, sku: string, optionsJson: string | null, product: { id: string, name: string, slug: string, storeId: string, thumbnailUrl: string | null, store: { id: string, name: string, slug: string } | null } | null } | null }> } };

export type ApprovedCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type ApprovedCategoriesQuery = { approvedCategories: Array<{ id: string, name: string, slug: string, imageUrl: string | null }> };

export type OrderItemFieldsFragment = { id: string, variantId: string, storeId: string, productName: string, quantity: number, unitPrice: number, subtotal: number, fulfillmentStatus: string };

export type OrderStoreShippingFieldsFragment = { storeId: string, optionName: string, shippingFee: number };

export type OrderShippingAddressFieldsFragment = { fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string };

export type OrderFieldsFragment = { id: string, orderNumber: string, status: string, createdAt: string, paymentMethod: string, subtotal: number, shippingFee: number, discountAmount: number, total: number, guestEmail: string | null, guestName: string | null, guestPhone: string | null, items: Array<{ id: string, variantId: string, storeId: string, productName: string, quantity: number, unitPrice: number, subtotal: number, fulfillmentStatus: string }>, storeShippings: Array<{ storeId: string, optionName: string, shippingFee: number }>, shippingAddress: { fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string } | null };

export type ValidatePromotionQueryVariables = Exact<{
  input: ValidatePromotionInput;
}>;


export type ValidatePromotionQuery = { validatePromotion: { code: string, name: string, discountAmount: number } };

export type CreateOrderMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export type CreateOrderMutation = { createOrder: { id: string, orderNumber: string, status: string, createdAt: string, paymentMethod: string, subtotal: number, shippingFee: number, discountAmount: number, total: number, guestEmail: string | null, guestName: string | null, guestPhone: string | null, items: Array<{ id: string, variantId: string, storeId: string, productName: string, quantity: number, unitPrice: number, subtotal: number, fulfillmentStatus: string }>, storeShippings: Array<{ storeId: string, optionName: string, shippingFee: number }>, shippingAddress: { fullName: string, phone: string, addressLine1: string, addressLine2: string | null, amphoe: string, tumbon: string | null, province: string, postalCode: string } | null } };

export type CreatePaymentMutationVariables = Exact<{
  input: CreatePaymentInput;
}>;


export type CreatePaymentMutation = { createPayment: { id: string, orderId: string, amount: number, currency: string, status: string, paymentMethod: string, authorizeUri: string | null, qrCodeUrl: string | null } };

export type DisputeFieldsFragment = { id: string, orderId: string, reason: string, issueType: string, status: string, createdAt: string, updatedAt: string, messages: Array<{ id: string, senderType: string, message: string, attachments: Array<string>, createdAt: string }>, images: Array<{ id: string, imageUrl: string, sortOrder: number }> };

export type MyDisputesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyDisputesQuery = { myDisputes: Array<{ id: string, orderId: string, reason: string, issueType: string, status: string, createdAt: string, updatedAt: string, messages: Array<{ id: string, senderType: string, message: string, attachments: Array<string>, createdAt: string }>, images: Array<{ id: string, imageUrl: string, sortOrder: number }> }> };

export type CreateDisputeMutationVariables = Exact<{
  input: CreateDisputeInput;
}>;


export type CreateDisputeMutation = { createDispute: { id: string, orderId: string, reason: string, issueType: string, status: string, createdAt: string, updatedAt: string, messages: Array<{ id: string, senderType: string, message: string, attachments: Array<string>, createdAt: string }>, images: Array<{ id: string, imageUrl: string, sortOrder: number }> } };

export type FavoriteProductFieldsFragment = { id: string, name: string, slug: string, basePrice: number, thumbnailUrl: string | null, images: Array<{ id: string, imageUrl: string, sortOrder: number }> | null };

export type FavoritesQueryVariables = Exact<{ [key: string]: never; }>;


export type FavoritesQuery = { favorites: Array<{ id: string, productId: string, product: { id: string, name: string, slug: string, basePrice: number, thumbnailUrl: string | null, images: Array<{ id: string, imageUrl: string, sortOrder: number }> | null } | null }> };

export type AddFavoriteMutationVariables = Exact<{
  input: FavoriteProductInput;
}>;


export type AddFavoriteMutation = { addFavorite: { id: string, productId: string, product: { id: string, name: string, slug: string, basePrice: number, thumbnailUrl: string | null, images: Array<{ id: string, imageUrl: string, sortOrder: number }> | null } | null } };

export type RemoveFavoriteMutationVariables = Exact<{
  input: FavoriteProductInput;
}>;


export type RemoveFavoriteMutation = { removeFavorite: boolean };

export type HealthQueryVariables = Exact<{ [key: string]: never; }>;


export type HealthQuery = { health: { status: string, api: string, timestamp: string } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: { customer: { id: string, phone: string, email: string | null, fullName: string | null } | null } };

export type NotificationsQueryVariables = Exact<{
  unreadOnly?: boolean | null | undefined;
}>;


export type NotificationsQuery = { notifications: Array<{ id: string, type: string, title: string | null, message: string, metadata: string | null, isRead: boolean, createdAt: string }> };

export type UnreadCountQueryVariables = Exact<{ [key: string]: never; }>;


export type UnreadCountQuery = { unreadNotificationsCount: number };

export type MarkNotificationReadMutationVariables = Exact<{
  id: string;
}>;


export type MarkNotificationReadMutation = { markNotificationRead: boolean };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: boolean };

export type OrderConfirmationFieldsFragment = { id: string, orderNumber: string, status: string, createdAt: string, subtotal: number, shippingFee: number, discountAmount: number, total: number, paymentMethod: string, items: Array<{ id: string, variantId: string, storeId: string, productName: string, unitPrice: number, quantity: number, subtotal: number, fulfillmentStatus: string }>, storeShippings: Array<{ storeId: string, optionName: string, shippingFee: number }> };

export type OrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type OrdersQuery = { orders: Array<{ id: string, orderNumber: string, status: string, createdAt: string, subtotal: number, shippingFee: number, discountAmount: number, total: number, paymentMethod: string, items: Array<{ id: string, variantId: string, storeId: string, productName: string, unitPrice: number, quantity: number, subtotal: number, fulfillmentStatus: string }>, storeShippings: Array<{ storeId: string, optionName: string, shippingFee: number }> }> };

export type OrderQueryVariables = Exact<{
  id: string;
}>;


export type OrderQuery = { order: { id: string, orderNumber: string, status: string, createdAt: string, subtotal: number, shippingFee: number, discountAmount: number, total: number, paymentMethod: string, items: Array<{ id: string, variantId: string, storeId: string, productName: string, unitPrice: number, quantity: number, subtotal: number, fulfillmentStatus: string }>, storeShippings: Array<{ storeId: string, optionName: string, shippingFee: number }> } };

export type GuestOrdersQueryVariables = Exact<{
  guestPhone: string;
}>;


export type GuestOrdersQuery = { guestOrders: Array<{ id: string, orderNumber: string, status: string, createdAt: string, subtotal: number, shippingFee: number, discountAmount: number, total: number, paymentMethod: string, items: Array<{ id: string, variantId: string, storeId: string, productName: string, unitPrice: number, quantity: number, subtotal: number, fulfillmentStatus: string }>, storeShippings: Array<{ storeId: string, optionName: string, shippingFee: number }> }> };

export type PaymentFieldsFragment = { id: string, orderId: string, amount: number, currency: string, status: string, paymentMethod: string, authorizeUri: string | null, qrCodeUrl: string | null };

export type PaymentQueryVariables = Exact<{
  id: string;
}>;


export type PaymentQuery = { payment: { id: string, orderId: string, amount: number, currency: string, status: string, paymentMethod: string, authorizeUri: string | null, qrCodeUrl: string | null } };

export type PaymentByOrderIdQueryVariables = Exact<{
  orderId: string;
}>;


export type PaymentByOrderIdQuery = { paymentByOrderId: { id: string, orderId: string, amount: number, currency: string, status: string, paymentMethod: string, authorizeUri: string | null, qrCodeUrl: string | null } };

export type SavedPaymentMethodFieldsFragment = { id: string, type: string, lastFour: string, brand: string, expiryMonth: number, expiryYear: number, isDefault: boolean };

export type PaymentMethodsQueryVariables = Exact<{ [key: string]: never; }>;


export type PaymentMethodsQuery = { paymentMethods: Array<{ id: string, type: string, lastFour: string, brand: string, expiryMonth: number, expiryYear: number, isDefault: boolean }> };

export type AddPaymentMethodMutationVariables = Exact<{
  input: AddPaymentMethodInput;
}>;


export type AddPaymentMethodMutation = { addPaymentMethod: { id: string, type: string, lastFour: string, brand: string, expiryMonth: number, expiryYear: number, isDefault: boolean } };

export type DeletePaymentMethodMutationVariables = Exact<{
  id: string;
}>;


export type DeletePaymentMethodMutation = { deletePaymentMethod: boolean };

export type SetDefaultPaymentMethodMutationVariables = Exact<{
  id: string;
}>;


export type SetDefaultPaymentMethodMutation = { setDefaultPaymentMethod: { id: string, type: string, lastFour: string, brand: string, expiryMonth: number, expiryYear: number, isDefault: boolean } };

export type PlatformBannersQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformBannersQuery = { platformBanners: Array<{ id: string, title: string, imageUrl: string, mobileImageUrl: string | null, linkUrl: string | null, sortOrder: number, isActive: boolean, startsAt: string | null, endsAt: string | null }> };

export type PlatformAdsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformAdsQuery = { platformAds: Array<{ id: string, title: string, imageUrl: string, linkUrl: string | null, sortOrder: number, isActive: boolean, startsAt: string | null, endsAt: string | null }> };

export type PlatformSponsorsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformSponsorsQuery = { platformSponsors: Array<{ id: string, name: string, imageUrl: string, linkUrl: string | null, sortOrder: number, isActive: boolean, startsAt: string | null, endsAt: string | null }> };

export type PlatformSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type PlatformSettingsQuery = { platformSettings: { currency: string, storefrontUrl: string, supportEmail: string } };

export type ProductDetailFieldsFragment = { id: string, slug: string, storeId: string, name: string, description: string | null, basePrice: number, compareAtPrice: number | null, thumbnailUrl: string | null, averageRating: number, reviewCount: number, soldCount: number, status: string, category: string | null, tags: Array<string>, warning: string | null, expiryDate: string | null, store: { id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null } | null, images: Array<{ id: string, imageUrl: string, isThumbnail: boolean, sortOrder: number }> | null, variants: Array<{ id: string, sku: string, price: number, stockQuantity: number, optionsJson: string | null }> | null };

export type ProductBySlugQueryVariables = Exact<{
  slug: string;
  storeId: string;
}>;


export type ProductBySlugQuery = { productBySlug: { id: string, slug: string, storeId: string, name: string, description: string | null, basePrice: number, compareAtPrice: number | null, thumbnailUrl: string | null, averageRating: number, reviewCount: number, soldCount: number, status: string, category: string | null, tags: Array<string>, warning: string | null, expiryDate: string | null, store: { id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null } | null, images: Array<{ id: string, imageUrl: string, isThumbnail: boolean, sortOrder: number }> | null, variants: Array<{ id: string, sku: string, price: number, stockQuantity: number, optionsJson: string | null }> | null } };

export type ProductByIdQueryVariables = Exact<{
  id: string;
}>;


export type ProductByIdQuery = { product: { id: string, slug: string, storeId: string, name: string, description: string | null, basePrice: number, compareAtPrice: number | null, thumbnailUrl: string | null, averageRating: number, reviewCount: number, soldCount: number, status: string, category: string | null, tags: Array<string>, warning: string | null, expiryDate: string | null, store: { id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null } | null, images: Array<{ id: string, imageUrl: string, isThumbnail: boolean, sortOrder: number }> | null, variants: Array<{ id: string, sku: string, price: number, stockQuantity: number, optionsJson: string | null }> | null } };

export type ProductCardFieldsFragment = { id: string, name: string, slug: string, storeId: string, basePrice: number, compareAtPrice: number | null, thumbnailUrl: string | null, averageRating: number, reviewCount: number, soldCount: number };

export type ProductsQueryVariables = Exact<{
  category?: string | null | undefined;
  page?: number | null | undefined;
  limit?: number | null | undefined;
  search?: string | null | undefined;
  storeId?: string | null | undefined;
  tag?: string | null | undefined;
}>;


export type ProductsQuery = { products: { items: Array<{ id: string, name: string, slug: string, storeId: string, basePrice: number, compareAtPrice: number | null, thumbnailUrl: string | null, averageRating: number, reviewCount: number, soldCount: number, store: { id: string, name: string, slug: string } | null }>, pagination: { page: number, limit: number, total: number, totalPages: number } } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: { id: string, phone: string, email: string | null, fullName: string | null } };

export type StorePromotionFieldsFragment = { id: string, code: string, name: string, description: string | null, type: string, discountValue: number, minPurchaseAmount: number | null, maxDiscountAmount: number | null, expiresAt: string | null, scope: string, storeId: string | null };

export type ActiveStorePromotionsQueryVariables = Exact<{
  storeId: string;
}>;


export type ActiveStorePromotionsQuery = { activeStorePromotions: Array<{ id: string, code: string, name: string, description: string | null, type: string, discountValue: number, minPurchaseAmount: number | null, maxDiscountAmount: number | null, expiresAt: string | null, scope: string, storeId: string | null }> };

export type ActivePlatformPromotionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ActivePlatformPromotionsQuery = { activePlatformPromotions: Array<{ id: string, code: string, name: string, description: string | null, type: string, discountValue: number, minPurchaseAmount: number | null, maxDiscountAmount: number | null, expiresAt: string | null, scope: string, storeId: string | null }> };

export type RecommendedProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type RecommendedProductsQuery = { recommendedProducts: Array<{ id: string, name: string, slug: string, storeId: string, basePrice: number, compareAtPrice: number | null, thumbnailUrl: string | null, averageRating: number, reviewCount: number, soldCount: number }> };

export type ProductReviewsQueryVariables = Exact<{
  productId: string;
}>;


export type ProductReviewsQuery = { productReviews: Array<{ id: string, productId: string, rating: number, comment: string | null, status: string, createdAt: string, customerName: string, images: Array<{ id: string, url: string }> }> };

export type StoreProductReviewsQueryVariables = Exact<{
  storeId: string;
}>;


export type StoreProductReviewsQuery = { storeProductReviews: Array<{ id: string, productId: string, productName: string, rating: number, comment: string | null, createdAt: string, customerName: string }> };

export type StoreReviewSummaryQueryVariables = Exact<{
  storeId: string;
}>;


export type StoreReviewSummaryQuery = { storeReviewSummary: { averageRating: number, totalCount: number, productBreakdown: Array<{ productId: string, productName: string, averageRating: number, reviewCount: number }> } };

export type CreateReviewMutationVariables = Exact<{
  input: CreateReviewInput;
}>;


export type CreateReviewMutation = { createReview: { id: string, productId: string, rating: number, comment: string | null, status: string, createdAt: string, customerName: string } };

export type StoreShippingOptionFieldsFragment = { id: string, storeId: string, name: string, description: string | null, price: number, isActive: boolean, sortOrder: number, providerId: string | null };

export type StoreShippingOptionsQueryVariables = Exact<{
  storeId: string;
}>;


export type StoreShippingOptionsQuery = { storeShippingOptions: Array<{ id: string, storeId: string, name: string, description: string | null, price: number, isActive: boolean, sortOrder: number, providerId: string | null }> };

export type StoreFieldsFragment = { id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null, status: string };

export type StoreQueryVariables = Exact<{
  id: string;
}>;


export type StoreQuery = { store: { id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null, status: string } };

export type StoreBySlugQueryVariables = Exact<{
  slug: string;
}>;


export type StoreBySlugQuery = { storeBySlug: { id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null, status: string } };

export type StoresQueryVariables = Exact<{ [key: string]: never; }>;


export type StoresQuery = { stores: Array<{ id: string, name: string, slug: string, logoUrl: string | null, bannerUrl: string | null, description: string | null, status: string }> };

export const SavedAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SavedAddressFieldsFragment, unknown>;
export const CartItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CartItemFieldsFragment, unknown>;
export const CartFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartItemFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CartFieldsFragment, unknown>;
export const OrderItemFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}}]} as unknown as DocumentNode<OrderItemFieldsFragment, unknown>;
export const OrderStoreShippingFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderStoreShippingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStoreShippingType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}}]} as unknown as DocumentNode<OrderStoreShippingFieldsFragment, unknown>;
export const OrderShippingAddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderShippingAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderShippingAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}}]} as unknown as DocumentNode<OrderShippingAddressFieldsFragment, unknown>;
export const OrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"guestEmail"}},{"kind":"Field","name":{"kind":"Name","value":"guestName"}},{"kind":"Field","name":{"kind":"Name","value":"guestPhone"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeShippings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderStoreShippingFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderShippingAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderStoreShippingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStoreShippingType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderShippingAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderShippingAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}}]} as unknown as DocumentNode<OrderFieldsFragment, unknown>;
export const DisputeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DisputeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DisputeType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"issueType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderType"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]}}]} as unknown as DocumentNode<DisputeFieldsFragment, unknown>;
export const FavoriteProductFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FavoriteProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]}}]} as unknown as DocumentNode<FavoriteProductFieldsFragment, unknown>;
export const OrderConfirmationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeShippings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}}]}}]} as unknown as DocumentNode<OrderConfirmationFieldsFragment, unknown>;
export const PaymentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"authorizeUri"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}}]}}]} as unknown as DocumentNode<PaymentFieldsFragment, unknown>;
export const SavedPaymentMethodFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lastFour"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"expiryMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expiryYear"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SavedPaymentMethodFieldsFragment, unknown>;
export const ProductDetailFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"warning"}},{"kind":"Field","name":{"kind":"Name","value":"expiryDate"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isThumbnail"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}}]}}]}}]} as unknown as DocumentNode<ProductDetailFieldsFragment, unknown>;
export const ProductCardFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}}]}}]} as unknown as DocumentNode<ProductCardFieldsFragment, unknown>;
export const StorePromotionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorePromotionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromotionType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"minPurchaseAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<StorePromotionFieldsFragment, unknown>;
export const StoreShippingOptionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreShippingOptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreShippingOptionType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}}]}}]} as unknown as DocumentNode<StoreShippingOptionFieldsFragment, unknown>;
export const StoreFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<StoreFieldsFragment, unknown>;
export const RequestAccountDeletionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestAccountDeletion"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestAccountDeletion"}}]}}]} as unknown as DocumentNode<RequestAccountDeletionMutation, RequestAccountDeletionMutationVariables>;
export const AddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AddressesQuery, AddressesQueryVariables>;
export const CreateAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<CreateAddressMutation, CreateAddressMutationVariables>;
export const UpdateAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateAddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<UpdateAddressMutation, UpdateAddressMutationVariables>;
export const DeleteAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAddressMutation, DeleteAddressMutationVariables>;
export const SetDefaultAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetDefaultAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setDefaultAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedAddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SetDefaultAddressMutation, SetDefaultAddressMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RefreshTokenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const SendCustomerOtpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendCustomerOtp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendCustomerOtpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendCustomerOtp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<SendCustomerOtpMutation, SendCustomerOtpMutationVariables>;
export const VerifyCustomerOtpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyCustomerOtp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyCustomerOtpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyCustomerOtp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingDeletion"}},{"kind":"Field","name":{"kind":"Name","value":"reactivationToken"}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]}}]} as unknown as DocumentNode<VerifyCustomerOtpMutation, VerifyCustomerOtpMutationVariables>;
export const ReactivateAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReactivateAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReactivateAccountInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reactivateAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingDeletion"}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}}]}}]}}]}}]} as unknown as DocumentNode<ReactivateAccountMutation, ReactivateAccountMutationVariables>;
export const CartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Cart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartItemFields"}}]}}]}}]} as unknown as DocumentNode<CartQuery, CartQueryVariables>;
export const AddToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartItemFields"}}]}}]}}]} as unknown as DocumentNode<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCartItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartItemFields"}}]}}]}}]} as unknown as DocumentNode<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveCartItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartItemFields"}}]}}]}}]} as unknown as DocumentNode<RemoveCartItemMutation, RemoveCartItemMutationVariables>;
export const MergeCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergeCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mergeCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"productVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CartType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sessionId"}},{"kind":"Field","name":{"kind":"Name","value":"customerId"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartItemFields"}}]}}]}}]} as unknown as DocumentNode<MergeCartMutation, MergeCartMutationVariables>;
export const ApprovedCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ApprovedCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approvedCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}}]}}]}}]} as unknown as DocumentNode<ApprovedCategoriesQuery, ApprovedCategoriesQueryVariables>;
export const ValidatePromotionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ValidatePromotion"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ValidatePromotionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validatePromotion"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}}]}}]}}]} as unknown as DocumentNode<ValidatePromotionQuery, ValidatePromotionQueryVariables>;
export const CreateOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderItemFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderItemType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderStoreShippingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStoreShippingType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderShippingAddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderShippingAddressType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine1"}},{"kind":"Field","name":{"kind":"Name","value":"addressLine2"}},{"kind":"Field","name":{"kind":"Name","value":"amphoe"}},{"kind":"Field","name":{"kind":"Name","value":"tumbon"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"guestEmail"}},{"kind":"Field","name":{"kind":"Name","value":"guestName"}},{"kind":"Field","name":{"kind":"Name","value":"guestPhone"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderItemFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeShippings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderStoreShippingFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderShippingAddressFields"}}]}}]}}]} as unknown as DocumentNode<CreateOrderMutation, CreateOrderMutationVariables>;
export const CreatePaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePaymentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"authorizeUri"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}}]}}]} as unknown as DocumentNode<CreatePaymentMutation, CreatePaymentMutationVariables>;
export const MyDisputesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyDisputes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myDisputes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DisputeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DisputeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DisputeType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"issueType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderType"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]}}]} as unknown as DocumentNode<MyDisputesQuery, MyDisputesQueryVariables>;
export const CreateDisputeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDispute"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateDisputeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDispute"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DisputeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DisputeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"DisputeType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"issueType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"messages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"senderType"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"attachments"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]}}]} as unknown as DocumentNode<CreateDisputeMutation, CreateDisputeMutationVariables>;
export const FavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Favorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"favorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FavoriteProductFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FavoriteProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]}}]} as unknown as DocumentNode<FavoritesQuery, FavoritesQueryVariables>;
export const AddFavoriteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddFavorite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FavoriteProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addFavorite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"FavoriteProductFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"FavoriteProductFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}}]}}]} as unknown as DocumentNode<AddFavoriteMutation, AddFavoriteMutationVariables>;
export const RemoveFavoriteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFavorite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FavoriteProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFavorite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>;
export const HealthDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"health"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"api"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const NotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Notifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const UnreadCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UnreadCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationsCount"}}]}}]} as unknown as DocumentNode<UnreadCountQuery, UnreadCountQueryVariables>;
export const MarkNotificationReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsReadMutation, MarkAllNotificationsReadMutationVariables>;
export const OrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeShippings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}}]}}]} as unknown as DocumentNode<OrdersQuery, OrdersQueryVariables>;
export const OrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Order"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeShippings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}}]}}]} as unknown as DocumentNode<OrderQuery, OrderQueryVariables>;
export const GuestOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GuestOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"guestPhone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"guestOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"guestPhone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"guestPhone"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderConfirmationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderConfirmationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"OrderType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"variantId"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"fulfillmentStatus"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeShippings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"optionName"}},{"kind":"Field","name":{"kind":"Name","value":"shippingFee"}}]}}]}}]} as unknown as DocumentNode<GuestOrdersQuery, GuestOrdersQueryVariables>;
export const PaymentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Payment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"authorizeUri"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}}]}}]} as unknown as DocumentNode<PaymentQuery, PaymentQueryVariables>;
export const PaymentByOrderIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaymentByOrderId"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentByOrderId"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PaymentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PaymentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PaymentType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"authorizeUri"}},{"kind":"Field","name":{"kind":"Name","value":"qrCodeUrl"}}]}}]} as unknown as DocumentNode<PaymentByOrderIdQuery, PaymentByOrderIdQueryVariables>;
export const PaymentMethodsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PaymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"paymentMethods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lastFour"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"expiryMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expiryYear"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<PaymentMethodsQuery, PaymentMethodsQueryVariables>;
export const AddPaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPaymentMethodInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lastFour"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"expiryMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expiryYear"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<AddPaymentMethodMutation, AddPaymentMethodMutationVariables>;
export const DeletePaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>;
export const SetDefaultPaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetDefaultPaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setDefaultPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SavedPaymentMethodFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SavedPaymentMethodFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SavedPaymentMethodType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"lastFour"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"expiryMonth"}},{"kind":"Field","name":{"kind":"Name","value":"expiryYear"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}}]}}]} as unknown as DocumentNode<SetDefaultPaymentMethodMutation, SetDefaultPaymentMethodMutationVariables>;
export const PlatformBannersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformBanners"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformBanners"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"mobileImageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"linkUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}}]}}]} as unknown as DocumentNode<PlatformBannersQuery, PlatformBannersQueryVariables>;
export const PlatformAdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformAds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformAds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"linkUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}}]}}]} as unknown as DocumentNode<PlatformAdsQuery, PlatformAdsQueryVariables>;
export const PlatformSponsorsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformSponsors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformSponsors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"linkUrl"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"startsAt"}},{"kind":"Field","name":{"kind":"Name","value":"endsAt"}}]}}]}}]} as unknown as DocumentNode<PlatformSponsorsQuery, PlatformSponsorsQueryVariables>;
export const PlatformSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PlatformSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"platformSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"storefrontUrl"}},{"kind":"Field","name":{"kind":"Name","value":"supportEmail"}}]}}]}}]} as unknown as DocumentNode<PlatformSettingsQuery, PlatformSettingsQueryVariables>;
export const ProductBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"warning"}},{"kind":"Field","name":{"kind":"Name","value":"expiryDate"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isThumbnail"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}}]}}]}}]} as unknown as DocumentNode<ProductBySlugQuery, ProductBySlugQueryVariables>;
export const ProductByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductDetailFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductDetailFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"warning"}},{"kind":"Field","name":{"kind":"Name","value":"expiryDate"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"isThumbnail"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"optionsJson"}}]}}]}}]} as unknown as DocumentNode<ProductByIdQuery, ProductByIdQueryVariables>;
export const ProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Products"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tag"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}},{"kind":"Argument","name":{"kind":"Name","value":"tag"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tag"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCardFields"}},{"kind":"Field","name":{"kind":"Name","value":"store"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pagination"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}}]}}]} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ActiveStorePromotionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveStorePromotions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeStorePromotions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorePromotionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorePromotionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromotionType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"minPurchaseAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<ActiveStorePromotionsQuery, ActiveStorePromotionsQueryVariables>;
export const ActivePlatformPromotionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActivePlatformPromotions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activePlatformPromotions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorePromotionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorePromotionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PromotionType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"discountValue"}},{"kind":"Field","name":{"kind":"Name","value":"minPurchaseAmount"}},{"kind":"Field","name":{"kind":"Name","value":"maxDiscountAmount"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"scope"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}}]}}]} as unknown as DocumentNode<ActivePlatformPromotionsQuery, ActivePlatformPromotionsQueryVariables>;
export const RecommendedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecommendedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recommendedProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCardFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCardFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"soldCount"}}]}}]} as unknown as DocumentNode<RecommendedProductsQuery, RecommendedProductsQueryVariables>;
export const ProductReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]} as unknown as DocumentNode<ProductReviewsQuery, ProductReviewsQueryVariables>;
export const StoreProductReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StoreProductReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeProductReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}}]}}]}}]} as unknown as DocumentNode<StoreProductReviewsQuery, StoreProductReviewsQueryVariables>;
export const StoreReviewSummaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StoreReviewSummary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeReviewSummary"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"productBreakdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"reviewCount"}}]}}]}}]}}]} as unknown as DocumentNode<StoreReviewSummaryQuery, StoreReviewSummaryQueryVariables>;
export const CreateReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"customerName"}}]}}]}}]} as unknown as DocumentNode<CreateReviewMutation, CreateReviewMutationVariables>;
export const StoreShippingOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StoreShippingOptions"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeShippingOptions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"storeId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreShippingOptionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreShippingOptionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreShippingOptionType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"storeId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"sortOrder"}},{"kind":"Field","name":{"kind":"Name","value":"providerId"}}]}}]} as unknown as DocumentNode<StoreShippingOptionsQuery, StoreShippingOptionsQueryVariables>;
export const StoreDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Store"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"store"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<StoreQuery, StoreQueryVariables>;
export const StoreBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StoreBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<StoreBySlugQuery, StoreBySlugQueryVariables>;
export const StoresDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Stores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stores"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StoreFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreType"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"logoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"bannerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]} as unknown as DocumentNode<StoresQuery, StoresQueryVariables>;