export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string };
};

export type AcceptStoreMemberInvitationInput = {
  fullName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
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

export type AdminAuditLogConnection = {
  __typename?: 'AdminAuditLogConnection';
  items: Array<AdminAuditLogType>;
  pagination: PaginationMeta;
};

export type AdminAuditLogFilterInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  actorId?: InputMaybe<Scalars['String']['input']>;
  actorType?: InputMaybe<Scalars['String']['input']>;
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  resourceType?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AdminAuditLogType = {
  __typename?: 'AdminAuditLogType';
  action: Scalars['String']['output'];
  actorId?: Maybe<Scalars['String']['output']>;
  actorLabel?: Maybe<Scalars['String']['output']>;
  actorType: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['String']['output']>;
  resourceId?: Maybe<Scalars['String']['output']>;
  resourceType: Scalars['String']['output'];
};

export type AdminCustomerConnection = {
  __typename?: 'AdminCustomerConnection';
  items: Array<AdminCustomerType>;
  pagination: PaginationMeta;
};

export type AdminCustomerDetailType = {
  __typename?: 'AdminCustomerDetailType';
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  insights: AdminCustomerInsightsType;
  isActive: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AdminCustomerInsightsType = {
  __typename?: 'AdminCustomerInsightsType';
  addressCount: Scalars['Int']['output'];
  averageOrderValue: Scalars['Float']['output'];
  favoriteCount: Scalars['Int']['output'];
  lastOrderAt?: Maybe<Scalars['DateTime']['output']>;
  orderCount: Scalars['Int']['output'];
  recentOrders: Array<AdminCustomerRecentOrder>;
  totalSpent: Scalars['Float']['output'];
};

export type AdminCustomerOrderItemSummary = {
  __typename?: 'AdminCustomerOrderItemSummary';
  productName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  subtotal: Scalars['Float']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type AdminCustomerRecentOrder = {
  __typename?: 'AdminCustomerRecentOrder';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  items: Array<AdminCustomerOrderItemSummary>;
  orderNumber: Scalars['String']['output'];
  status: Scalars['String']['output'];
  total: Scalars['Float']['output'];
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

export type AdminVendorActivityType = {
  __typename?: 'AdminVendorActivityType';
  kind: Scalars['String']['output'];
  occurredAt: Scalars['DateTime']['output'];
  orderNumber?: Maybe<Scalars['String']['output']>;
  storeId?: Maybe<Scalars['String']['output']>;
  storeName?: Maybe<Scalars['String']['output']>;
};

export type AdminVendorDetailType = {
  __typename?: 'AdminVendorDetailType';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  insights: AdminVendorInsightsType;
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  role: Scalars['String']['output'];
  stores: Array<AdminVendorStoreType>;
};

export type AdminVendorInsightsType = {
  __typename?: 'AdminVendorInsightsType';
  activities: Array<AdminVendorActivityType>;
  averageOrderValue: Scalars['Float']['output'];
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  lastOrderAt?: Maybe<Scalars['DateTime']['output']>;
  membershipCount: Scalars['Int']['output'];
  memberships: Array<AdminVendorMembershipType>;
  orderCount: Scalars['Int']['output'];
  recentOrders: Array<AdminCustomerRecentOrder>;
  storeCount: Scalars['Int']['output'];
  totalRevenue: Scalars['Float']['output'];
};

export type AdminVendorMembershipType = {
  __typename?: 'AdminVendorMembershipType';
  joinedAt: Scalars['DateTime']['output'];
  role: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  storeSlug: Scalars['String']['output'];
  storeStatus: Scalars['String']['output'];
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

export type BrandType = {
  __typename?: 'BrandType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type ChangeCustomerPhoneInput = {
  code: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type ConfirmOrderDeliveredInput = {
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['String']['input'];
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

export type CreateBrandInput = {
  name: Scalars['String']['input'];
};

export type CreateCategoryInput = {
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateOrderInput = {
  cartItemIds?: InputMaybe<Array<Scalars['String']['input']>>;
  guestEmail?: InputMaybe<Scalars['String']['input']>;
  guestName?: InputMaybe<Scalars['String']['input']>;
  guestPhone?: InputMaybe<Scalars['String']['input']>;
  items: Array<OrderItemInput>;
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: Scalars['String']['input'];
  platformPromotionCode?: InputMaybe<Scalars['String']['input']>;
  promotionCode?: InputMaybe<Scalars['String']['input']>;
  savedAddressId?: InputMaybe<Scalars['String']['input']>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
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

export type CreatePetTypeInput = {
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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
  brandId?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  compareAtPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  petTypeId?: InputMaybe<Scalars['String']['input']>;
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
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  orderId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
  rating: Scalars['Int']['input'];
};

export type CreateReviewReplyInput = {
  body: Scalars['String']['input'];
  reviewId: Scalars['String']['input'];
};

export type CreateSearchSynonymInput = {
  expansion: Scalars['String']['input'];
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  terms: Array<Scalars['String']['input']>;
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

export enum CustomerOrderListFilter {
  All = 'ALL',
  Cancelled = 'CANCELLED',
  Delivered = 'DELIVERED',
  InProgress = 'IN_PROGRESS',
  PendingPayment = 'PENDING_PAYMENT',
}

export type CustomerProfile = {
  __typename?: 'CustomerProfile';
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  profilePhotoUrl?: Maybe<Scalars['String']['output']>;
};

export type CustomerReviewType = {
  __typename?: 'CustomerReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  images: Array<ReviewImageType>;
  orderId: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSlug?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Int']['output'];
  status: Scalars['String']['output'];
};

export type CustomerReviewableItemType = {
  __typename?: 'CustomerReviewableItemType';
  deliveredAt: Scalars['DateTime']['output'];
  orderId: Scalars['String']['output'];
  orderItemId: Scalars['String']['output'];
  orderNumber: Scalars['String']['output'];
  productId: Scalars['String']['output'];
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSlug?: Maybe<Scalars['String']['output']>;
  reviewDeadline?: Maybe<Scalars['DateTime']['output']>;
};

export type DeleteTaxonomyInput = {
  id: Scalars['String']['input'];
  replacementCategoryId?: InputMaybe<Scalars['String']['input']>;
};

export type DeleteTaxonomyResultType = {
  __typename?: 'DeleteTaxonomyResultType';
  deletedCategoryId?: Maybe<Scalars['String']['output']>;
  deletedId: Scalars['String']['output'];
  detachedProductCount: Scalars['Int']['output'];
  notifiedStoreCount: Scalars['Int']['output'];
  reassignedProductCount?: Maybe<Scalars['Int']['output']>;
  replacementCategoryId?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
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
  acceptStoreMemberInvitation: VendorAuthPayload;
  acceptVendorInvitation: VendorAuthPayload;
  acknowledgeVendorOrder: OrderType;
  addFavorite: FavoriteType;
  addPaymentMethod: SavedPaymentMethodType;
  addProductImage: ProductImageType;
  addToCart: CartType;
  adminCreateStoreShippingOption: StoreShippingOptionType;
  adminDeleteStoreShippingOption: Scalars['Boolean']['output'];
  adminLogin: VendorAuthPayload;
  adminResendVendorEmailVerification: MessagePayload;
  adminTriggerVendorPasswordReset: MessagePayload;
  adminUpdateStoreShippingOption: StoreShippingOptionType;
  adminVerifyVendorEmail: MessagePayload;
  approveBrand: BrandType;
  approveCategory: CategoryType;
  approvePetType: PetTypeType;
  approveStore: StoreType;
  approveStoreReactivationRequest: StoreReactivationRequestType;
  approveStoreRequest: StoreRequestType;
  approveTag: TagType;
  cancelVendorOrder: OrderType;
  changeCustomerPhone: CustomerAuthPayload;
  changePassword: MessagePayload;
  confirmGuestOrderDelivered: OrderType;
  confirmOrderDelivered: OrderType;
  createAddress: SavedAddressType;
  createBrand: BrandType;
  createCategory: CategoryType;
  createOrder: OrderType;
  createPayment: PaymentType;
  createPayout: PayoutType;
  createPetType: PetTypeType;
  createPlatformAd: PlatformAdType;
  createPlatformBanner: PlatformBannerType;
  createPlatformSponsor: PlatformSponsorType;
  createProduct: ProductType;
  createProductVariant: ProductVariantType;
  createPromotion: PromotionType;
  createReview: ReviewType;
  createReviewReply: ReviewReplyType;
  createSearchSynonym: SearchSynonymType;
  createShippingOption: StoreShippingOptionType;
  createShippingProvider: ShippingProviderType;
  createStoreApiKey: CreateStoreApiKeyPayload;
  createStoreAsAdmin: AdminStoreType;
  createTag: TagType;
  declineStoreInvitation: Scalars['Boolean']['output'];
  deleteAddress: Scalars['Boolean']['output'];
  deleteBrand: DeleteTaxonomyResultType;
  deleteCategory: DeleteTaxonomyResultType;
  deletePaymentMethod: Scalars['Boolean']['output'];
  deletePetType: DeleteTaxonomyResultType;
  deletePlatformAd: Scalars['Boolean']['output'];
  deletePlatformBanner: Scalars['Boolean']['output'];
  deletePlatformSponsor: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteProductImage: Scalars['Boolean']['output'];
  deleteProductVariant: Scalars['Boolean']['output'];
  deletePromotion: Scalars['Boolean']['output'];
  deleteSearchSynonym: Scalars['Boolean']['output'];
  deleteShippingOption: Scalars['Boolean']['output'];
  deleteShippingProvider: Scalars['Boolean']['output'];
  deleteTag: DeleteTaxonomyResultType;
  inviteAdmin: AdminInvitationType;
  inviteStoreMember: StoreMemberInvitationType;
  inviteVendor: VendorInvitationType;
  markAllNotificationsRead: Scalars['Boolean']['output'];
  markNotificationRead: Scalars['Boolean']['output'];
  markVendorOrderPaid: OrderType;
  mergeCart: CartType;
  publishProduct: ProductType;
  reactivateAccount: CustomerAuthPayload;
  refreshToken: AuthTokens;
  registerStore: VendorAuthPayload;
  registerVendor: VendorAuthPayload;
  rejectBrand: BrandType;
  rejectCategory: CategoryType;
  rejectPetType: PetTypeType;
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
  requestPayout: PayoutType;
  resendEmailVerification: MessagePayload;
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
  setPetTypeImage: PetTypeType;
  setProductThumbnail: ProductImageType;
  shipVendorOrder: OrderType;
  submitStoreReactivationRequest: StoreReactivationRequestType;
  submitStoreRequest: StoreRequestType;
  switchStore: VendorAuthPayload;
  syncProductVariants: Array<ProductVariantType>;
  togglePromotion: PromotionType;
  triggerPayout: PayoutType;
  updateAddress: SavedAddressType;
  updateBrand: BrandType;
  updateCartItem: CartType;
  updateCategory: CategoryType;
  updateCustomerAsAdmin: AdminCustomerType;
  updateOrderStatus: OrderType;
  updatePetType: PetTypeType;
  updatePlatformAd: PlatformAdType;
  updatePlatformBanner: PlatformBannerType;
  updatePlatformSponsor: PlatformSponsorType;
  updateProduct: ProductType;
  updateProductImage: ProductImageType;
  updateProductVariant: ProductVariantType;
  updateProfile: CustomerProfile;
  updatePromotion: PromotionType;
  updateReviewReply: ReviewReplyType;
  updateSearchRankingWeights: SearchRankingWeightsType;
  updateSearchSynonym: SearchSynonymType;
  updateShippingOption: StoreShippingOptionType;
  updateShippingProvider: ShippingProviderType;
  updateStore: MyStoreType;
  updateStoreAsAdmin: AdminStoreType;
  updateStoreMemberRole: StoreMemberType;
  updateStorePayout: MyStoreType;
  updateTag: TagType;
  updateUserProfile: UserProfile;
  updateVendorAsAdmin: AdminVendorType;
  uploadImage: UploadResultType;
  vendorLogin: VendorAuthPayload;
  verifyCustomerOtp: CustomerAuthPayload;
  verifyEmail: MessagePayload;
};

export type MutationAcceptStoreInvitationArgs = {
  token: Scalars['String']['input'];
};

export type MutationAcceptStoreMemberInvitationArgs = {
  input: AcceptStoreMemberInvitationInput;
};

export type MutationAcceptVendorInvitationArgs = {
  input: AcceptVendorInvitationInput;
};

export type MutationAcknowledgeVendorOrderArgs = {
  orderId: Scalars['String']['input'];
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

export type MutationAdminResendVendorEmailVerificationArgs = {
  vendorId: Scalars['String']['input'];
};

export type MutationAdminTriggerVendorPasswordResetArgs = {
  vendorId: Scalars['String']['input'];
};

export type MutationAdminUpdateStoreShippingOptionArgs = {
  id: Scalars['String']['input'];
  input: UpdateShippingOptionInput;
};

export type MutationAdminVerifyVendorEmailArgs = {
  vendorId: Scalars['String']['input'];
};

export type MutationApproveBrandArgs = {
  id: Scalars['String']['input'];
};

export type MutationApproveCategoryArgs = {
  id: Scalars['String']['input'];
};

export type MutationApprovePetTypeArgs = {
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

export type MutationCancelVendorOrderArgs = {
  orderId: Scalars['String']['input'];
};

export type MutationChangeCustomerPhoneArgs = {
  input: ChangeCustomerPhoneInput;
};

export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};

export type MutationConfirmGuestOrderDeliveredArgs = {
  input: ConfirmOrderDeliveredInput;
};

export type MutationConfirmOrderDeliveredArgs = {
  input: ConfirmOrderDeliveredInput;
};

export type MutationCreateAddressArgs = {
  input: CreateAddressInput;
};

export type MutationCreateBrandArgs = {
  input: CreateBrandInput;
};

export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
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

export type MutationCreatePetTypeArgs = {
  input: CreatePetTypeInput;
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

export type MutationCreateReviewReplyArgs = {
  input: CreateReviewReplyInput;
};

export type MutationCreateSearchSynonymArgs = {
  input: CreateSearchSynonymInput;
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

export type MutationDeleteBrandArgs = {
  input: DeleteTaxonomyInput;
};

export type MutationDeleteCategoryArgs = {
  input: DeleteTaxonomyInput;
};

export type MutationDeletePaymentMethodArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeletePetTypeArgs = {
  input: DeleteTaxonomyInput;
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

export type MutationDeleteSearchSynonymArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteShippingOptionArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteShippingProviderArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteTagArgs = {
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

export type MutationMarkVendorOrderPaidArgs = {
  orderId: Scalars['String']['input'];
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

export type MutationRegisterStoreArgs = {
  input: RegisterStoreInput;
};

export type MutationRegisterVendorArgs = {
  input: RegisterVendorInput;
};

export type MutationRejectBrandArgs = {
  id: Scalars['String']['input'];
};

export type MutationRejectCategoryArgs = {
  id: Scalars['String']['input'];
};

export type MutationRejectPetTypeArgs = {
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

export type MutationSetPetTypeImageArgs = {
  input: SetPetTypeImageInput;
};

export type MutationSetProductThumbnailArgs = {
  imageId: Scalars['String']['input'];
  productId: Scalars['String']['input'];
};

export type MutationShipVendorOrderArgs = {
  input: ShipVendorOrderInput;
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

export type MutationTriggerPayoutArgs = {
  input: TriggerPayoutInput;
};

export type MutationUpdateAddressArgs = {
  id: Scalars['String']['input'];
  input: UpdateAddressInput;
};

export type MutationUpdateBrandArgs = {
  input: UpdateBrandInput;
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

export type MutationUpdatePetTypeArgs = {
  input: UpdatePetTypeInput;
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

export type MutationUpdateReviewReplyArgs = {
  input: UpdateReviewReplyInput;
};

export type MutationUpdateSearchRankingWeightsArgs = {
  input: UpdateSearchRankingWeightsInput;
};

export type MutationUpdateSearchSynonymArgs = {
  id: Scalars['String']['input'];
  input: UpdateSearchSynonymInput;
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

export type MutationUpdateTagArgs = {
  input: UpdateTagInput;
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

export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
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

export type OrderConnection = {
  __typename?: 'OrderConnection';
  items: Array<OrderType>;
  pagination: PaginationMeta;
};

export type OrderItemInput = {
  price: Scalars['Float']['input'];
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  variantId?: InputMaybe<Scalars['String']['input']>;
};

export type OrderItemType = {
  __typename?: 'OrderItemType';
  fulfillmentProvider?: Maybe<Scalars['String']['output']>;
  fulfillmentStatus: Scalars['String']['output'];
  id: Scalars['String']['output'];
  productId?: Maybe<Scalars['String']['output']>;
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  trackingUrl?: Maybe<Scalars['String']['output']>;
  unitPrice: Scalars['Float']['output'];
  variantId: Scalars['String']['output'];
  /** JSON string of snapshot variant options from order create (e.g. {"ขนาด":"1kg"}) */
  variantOptions?: Maybe<Scalars['String']['output']>;
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

export type OrderTrackingItemType = {
  __typename?: 'OrderTrackingItemType';
  fulfillmentProvider?: Maybe<Scalars['String']['output']>;
  fulfillmentStatus: Scalars['String']['output'];
  productId?: Maybe<Scalars['String']['output']>;
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  storeId: Scalars['String']['output'];
  subtotal: Scalars['Float']['output'];
  trackingNumber?: Maybe<Scalars['String']['output']>;
  trackingUrl?: Maybe<Scalars['String']['output']>;
  unitPrice: Scalars['Float']['output'];
  /** JSON string of snapshot variant options from order create (e.g. {"ขนาด":"1kg"}) */
  variantOptions?: Maybe<Scalars['String']['output']>;
};

export type OrderTrackingStoreShippingType = {
  __typename?: 'OrderTrackingStoreShippingType';
  optionName: Scalars['String']['output'];
  shippingFee: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
};

export type OrderTrackingType = {
  __typename?: 'OrderTrackingType';
  createdAt: Scalars['DateTime']['output'];
  discountAmount: Scalars['Float']['output'];
  items: Array<OrderTrackingItemType>;
  orderNumber: Scalars['String']['output'];
  shippingFee: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  storeShippings: Array<OrderTrackingStoreShippingType>;
  subtotal: Scalars['Float']['output'];
  total: Scalars['Float']['output'];
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
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  orderId: Scalars['String']['output'];
  paymentMethod: Scalars['String']['output'];
  qrCodeUrl?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type PayoutSummaryType = {
  __typename?: 'PayoutSummaryType';
  availableBalance: Scalars['Float']['output'];
  canRequestPayout: Scalars['Boolean']['output'];
  grossRevenue: Scalars['Float']['output'];
  minimumPayoutAmount: Scalars['Float']['output'];
  pendingPayoutAmount: Scalars['Float']['output'];
  storeId: Scalars['String']['output'];
  totalPaidOut: Scalars['Float']['output'];
};

export type PayoutType = {
  __typename?: 'PayoutType';
  amount: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  netAmount: Scalars['Float']['output'];
  status: Scalars['String']['output'];
  storeId: Scalars['String']['output'];
};

export type PetTypeType = {
  __typename?: 'PetTypeType';
  approvalStatus: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy: Scalars['String']['output'];
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  brandId?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  categoryId?: Maybe<Scalars['String']['output']>;
  compareAtPrice?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  expiryDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  images?: Maybe<Array<ProductImageType>>;
  name: Scalars['String']['output'];
  petTypeId?: Maybe<Scalars['String']['output']>;
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

export type ProductVariantSyncImpactRemovedType = {
  __typename?: 'ProductVariantSyncImpactRemovedType';
  id: Scalars['String']['output'];
  optionKey: Scalars['String']['output'];
  optionsJson?: Maybe<Scalars['String']['output']>;
  reasons: Array<VariantRemovalBlockReason>;
  sku: Scalars['String']['output'];
};

export type ProductVariantSyncImpactType = {
  __typename?: 'ProductVariantSyncImpactType';
  blocked: Scalars['Boolean']['output'];
  kept: Scalars['Int']['output'];
  new: Scalars['Int']['output'];
  removed: Scalars['Int']['output'];
  removedVariants: Array<ProductVariantSyncImpactRemovedType>;
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
  freeUnits?: Maybe<Scalars['Int']['output']>;
  ineligibilityReason?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  activePlatformPromotions: Array<PromotionType>;
  activeStorePromotions: Array<PromotionType>;
  addresses: Array<SavedAddressType>;
  adminAuditLogs: AdminAuditLogConnection;
  adminCustomer: AdminCustomerType;
  adminCustomerDetail: AdminCustomerDetailType;
  adminCustomers: AdminCustomerConnection;
  adminStore: AdminStoreType;
  adminStorePayoutSummary: PayoutSummaryType;
  adminStorePayouts: Array<PayoutType>;
  adminStoreReactivationRequests: Array<StoreReactivationRequestType>;
  adminStoreShippingOptions: Array<StoreShippingOptionType>;
  adminStores: Array<AdminStoreType>;
  adminTeamMembers: Array<AdminTeamMemberType>;
  adminVendor: AdminVendorType;
  adminVendorDetail: AdminVendorDetailType;
  adminVendors: Array<AdminVendorType>;
  allPlatformAds: Array<PlatformAdType>;
  allPlatformBanners: Array<PlatformBannerType>;
  allPlatformSponsors: Array<PlatformSponsorType>;
  approvedBrands: Array<BrandType>;
  approvedCategories: Array<CategoryType>;
  approvedPetTypes: Array<PetTypeType>;
  approvedTags: Array<TagType>;
  brandDeleteImpact: TaxonomyDeleteImpactType;
  cart: CartType;
  categoryDeleteImpact: TaxonomyDeleteImpactType;
  customerReviewableItems: Array<CustomerReviewableItemType>;
  exportSearchAnalyticsCsv: Scalars['String']['output'];
  favorites: Array<FavoriteType>;
  getStoreInvitationByToken: StoreInvitationPreviewType;
  guestOrders: Array<OrderType>;
  /** GraphQL API health check */
  health: HealthStatus;
  latestPurchaseProduct?: Maybe<ProductType>;
  latestPurchaseProducts: Array<ProductType>;
  me: MeResult;
  myBrandProposals: Array<BrandType>;
  myCategoryProposals: Array<CategoryType>;
  myPetTypeProposals: Array<PetTypeType>;
  myReviews: Array<CustomerReviewType>;
  myStore: MyStoreType;
  myStoreRequests: Array<StoreRequestType>;
  myStoreShippingOptions: Array<StoreShippingOptionType>;
  myStores: Array<VendorStoreType>;
  myTagProposals: Array<TagType>;
  notifications: Array<NotificationType>;
  order: OrderType;
  orderTracking: OrderTrackingType;
  orders: OrderConnection;
  payment: PaymentType;
  paymentByOrderId: PaymentType;
  paymentMethods: Array<SavedPaymentMethodType>;
  pendingAdminInvitations: Array<AdminInvitationType>;
  pendingBrands: Array<BrandType>;
  pendingCategories: Array<CategoryType>;
  pendingPetTypes: Array<PetTypeType>;
  pendingStoreRequests: Array<StoreRequestType>;
  pendingStores: Array<StoreType>;
  pendingTags: Array<TagType>;
  pendingVendorInvitations: Array<VendorInvitationType>;
  petTypeDeleteImpact: TaxonomyDeleteImpactType;
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
  productVariantSyncImpact: ProductVariantSyncImpactType;
  products: ProductConnection;
  recommendedProducts: Array<ProductType>;
  rejectedBrands: Array<BrandType>;
  rejectedCategories: Array<CategoryType>;
  rejectedPetTypes: Array<PetTypeType>;
  rejectedTags: Array<TagType>;
  searchAnalyticsSuggestionCtr: Array<SearchSuggestionCtrRowType>;
  searchAnalyticsSummary: SearchAnalyticsSummaryType;
  searchAnalyticsTopQueries: Array<SearchAnalyticsQueryRowType>;
  searchAnalyticsZeroResultQueries: Array<SearchAnalyticsQueryRowType>;
  searchRankingWeights: SearchRankingWeightsType;
  searchRecoverySuggestions: Array<Scalars['String']['output']>;
  searchSuggestions: SearchSuggestionsPayloadType;
  searchSynonyms: Array<SearchSynonymType>;
  shippingProviders: Array<ShippingProviderType>;
  store: StoreType;
  storeAnalytics: StoreAnalyticsType;
  storeApiKeys: Array<StoreApiKeyType>;
  storeBySlug: StoreType;
  storeInvitations: Array<StoreMemberInvitationType>;
  storeMembers: Array<StoreMemberType>;
  storePayoutSummary: PayoutSummaryType;
  storePayouts: Array<PayoutType>;
  storeProductReviews: StoreProductReviewConnection;
  storePromotions: Array<PromotionType>;
  storeReactivationRequests: Array<StoreReactivationRequestType>;
  storeReviewSummary: StoreReviewSummaryType;
  storeReviews: Array<StoreProductReviewType>;
  storeShippingOptions: Array<StoreShippingOptionType>;
  stores: Array<StoreType>;
  tagDeleteImpact: TaxonomyDeleteImpactType;
  topProducts: Array<TopProductType>;
  unreadNotificationsCount: Scalars['Int']['output'];
  validatePromotion: PromotionValidationResult;
  vendorCustomer: VendorCustomerType;
  vendorCustomerDetail: VendorCustomerDetailType;
  vendorCustomers: VendorCustomerConnection;
  vendorOrders: Array<OrderType>;
  vendorProduct: ProductType;
  vendorProducts: ProductConnection;
};

export type QueryActiveStorePromotionsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryAdminAuditLogsArgs = {
  filter?: InputMaybe<AdminAuditLogFilterInput>;
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
};

export type QueryAdminCustomerArgs = {
  id: Scalars['String']['input'];
};

export type QueryAdminCustomerDetailArgs = {
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

export type QueryAdminStorePayoutSummaryArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryAdminStorePayoutsArgs = {
  storeId: Scalars['String']['input'];
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

export type QueryAdminVendorDetailArgs = {
  id: Scalars['String']['input'];
};

export type QueryAdminVendorsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryBrandDeleteImpactArgs = {
  brandId: Scalars['String']['input'];
};

export type QueryCartArgs = {
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryCategoryDeleteImpactArgs = {
  categoryId: Scalars['String']['input'];
};

export type QueryExportSearchAnalyticsCsvArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QueryGetStoreInvitationByTokenArgs = {
  token: Scalars['String']['input'];
};

export type QueryGuestOrdersArgs = {
  guestPhone: Scalars['String']['input'];
};

export type QueryLatestPurchaseProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMyReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryNotificationsArgs = {
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryOrderArgs = {
  id: Scalars['String']['input'];
};

export type QueryOrderTrackingArgs = {
  orderNumber: Scalars['String']['input'];
};

export type QueryOrdersArgs = {
  filter?: InputMaybe<CustomerOrderListFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryPaymentArgs = {
  id: Scalars['String']['input'];
};

export type QueryPaymentByOrderIdArgs = {
  orderId: Scalars['String']['input'];
};

export type QueryPetTypeDeleteImpactArgs = {
  petTypeId: Scalars['String']['input'];
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

export type QueryProductVariantSyncImpactArgs = {
  productId: Scalars['String']['input'];
  variants: Array<SyncProductVariantItemInput>;
};

export type QueryProductsArgs = {
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  petTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
  searchContext?: InputMaybe<SearchContextInput>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortOrder?: InputMaybe<Scalars['String']['input']>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type QueryRecommendedProductsArgs = {
  excludeProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  searchContext?: InputMaybe<SearchContextInput>;
  sessionId?: InputMaybe<Scalars['String']['input']>;
  shuffleSeed?: InputMaybe<Scalars['String']['input']>;
};

export type QuerySearchAnalyticsSuggestionCtrArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchAnalyticsSummaryArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchAnalyticsTopQueriesArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchAnalyticsZeroResultQueriesArgs = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type QuerySearchRecoverySuggestionsArgs = {
  query: Scalars['String']['input'];
};

export type QuerySearchSuggestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
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
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  ratingFilter?: InputMaybe<Scalars['String']['input']>;
  replyFilter?: InputMaybe<Scalars['String']['input']>;
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

export type QueryStoreReviewsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryStoreShippingOptionsArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryTagDeleteImpactArgs = {
  tagId: Scalars['String']['input'];
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

export type QueryVendorCustomerDetailArgs = {
  id: Scalars['String']['input'];
};

export type QueryVendorCustomersArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVendorOrdersArgs = {
  storeId: Scalars['String']['input'];
};

export type QueryVendorProductArgs = {
  id: Scalars['String']['input'];
};

export type QueryVendorProductsArgs = {
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  category?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  petTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  search?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
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

export type ReviewReplyType = {
  __typename?: 'ReviewReplyType';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  reply?: Maybe<ReviewReplyType>;
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

export type SearchAnalyticsQueryRowType = {
  __typename?: 'SearchAnalyticsQueryRowType';
  avgResultCount: Scalars['Float']['output'];
  query: Scalars['String']['output'];
  searchCount: Scalars['Int']['output'];
};

export type SearchAnalyticsSummaryType = {
  __typename?: 'SearchAnalyticsSummaryType';
  avgLatencyMs: Scalars['Float']['output'];
  avgResultsPerQuery: Scalars['Float']['output'];
  totalSearches: Scalars['Int']['output'];
  uniqueQueries: Scalars['Int']['output'];
  zeroResultRate: Scalars['Float']['output'];
};

export type SearchContextInput = {
  recentProductIds?: InputMaybe<Array<Scalars['String']['input']>>;
  recentQueries?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type SearchProductSuggestionType = {
  __typename?: 'SearchProductSuggestionType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
};

export type SearchQuerySuggestionType = {
  __typename?: 'SearchQuerySuggestionType';
  query: Scalars['String']['output'];
};

export type SearchRankingWeightsType = {
  __typename?: 'SearchRankingWeightsType';
  averageRating: Scalars['Float']['output'];
  personalizationCap: Scalars['Float']['output'];
  prefixBoost: Scalars['Float']['output'];
  reviewCount: Scalars['Float']['output'];
  rrfK: Scalars['Int']['output'];
  soldCount: Scalars['Float']['output'];
  text: Scalars['Float']['output'];
  trigramFallbackThreshold: Scalars['Int']['output'];
  trigramMinSimilarity: Scalars['Float']['output'];
};

export type SearchSuggestionCtrRowType = {
  __typename?: 'SearchSuggestionCtrRowType';
  clicks: Scalars['Int']['output'];
  ctr: Scalars['Float']['output'];
  impressions: Scalars['Int']['output'];
  prefixBucket: Scalars['String']['output'];
};

export type SearchSuggestionsPayloadType = {
  __typename?: 'SearchSuggestionsPayloadType';
  products: Array<SearchProductSuggestionType>;
  queries: Array<SearchQuerySuggestionType>;
};

export type SearchSynonymType = {
  __typename?: 'SearchSynonymType';
  expansion: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isActive: Scalars['Boolean']['output'];
  terms: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type SendCustomerOtpInput = {
  phone: Scalars['String']['input'];
};

export type SetCategoryImageInput = {
  categoryId: Scalars['String']['input'];
  imageUrl: Scalars['String']['input'];
};

export type SetPetTypeImageInput = {
  imageUrl: Scalars['String']['input'];
  petTypeId: Scalars['String']['input'];
};

export type ShipVendorOrderInput = {
  fulfillmentProvider: Scalars['String']['input'];
  orderId: Scalars['String']['input'];
  trackingNumber: Scalars['String']['input'];
  trackingUrl?: InputMaybe<Scalars['String']['input']>;
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

export type StoreInvitationPreviewType = {
  __typename?: 'StoreInvitationPreviewType';
  email: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  role: Scalars['String']['output'];
  storeName: Scalars['String']['output'];
  userExists: Scalars['Boolean']['output'];
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

export type StoreProductReviewConnection = {
  __typename?: 'StoreProductReviewConnection';
  items: Array<StoreProductReviewType>;
  pagination: PaginationMeta;
};

export type StoreProductReviewType = {
  __typename?: 'StoreProductReviewType';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customerName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  images: Array<ReviewImageType>;
  productId: Scalars['String']['output'];
  productImageUrl?: Maybe<Scalars['String']['output']>;
  productName: Scalars['String']['output'];
  productSlug?: Maybe<Scalars['String']['output']>;
  rating: Scalars['Int']['output'];
  reply?: Maybe<ReviewReplyType>;
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
  rating1Count: Scalars['Int']['output'];
  rating2Count: Scalars['Int']['output'];
  rating3Count: Scalars['Int']['output'];
  rating4Count: Scalars['Int']['output'];
  rating5Count: Scalars['Int']['output'];
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

export type Subscription = {
  __typename?: 'Subscription';
  paymentStatusUpdated: PaymentType;
};

export type SubscriptionPaymentStatusUpdatedArgs = {
  orderId?: InputMaybe<Scalars['String']['input']>;
  paymentId?: InputMaybe<Scalars['String']['input']>;
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

export type TaxonomyDeleteImpactProductType = {
  __typename?: 'TaxonomyDeleteImpactProductType';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type TaxonomyDeleteImpactType = {
  __typename?: 'TaxonomyDeleteImpactType';
  productCount: Scalars['Int']['output'];
  products: Array<TaxonomyDeleteImpactProductType>;
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

export type TriggerPayoutInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  storeId: Scalars['String']['input'];
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

export type UpdateBrandInput = {
  brandId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCartItemInput = {
  itemId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  sessionId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCategoryInput = {
  categoryId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
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

export type UpdatePetTypeInput = {
  name: Scalars['String']['input'];
  petTypeId: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
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
  brandId?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['String']['input']>;
  compareAtPrice?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expiryDate?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  petTypeId?: InputMaybe<Scalars['String']['input']>;
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
  dateOfBirth?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  profilePhotoUrl?: InputMaybe<Scalars['String']['input']>;
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

export type UpdateReviewReplyInput = {
  body: Scalars['String']['input'];
  replyId: Scalars['String']['input'];
};

export type UpdateSearchRankingWeightsInput = {
  averageRating?: InputMaybe<Scalars['Float']['input']>;
  personalizationCap?: InputMaybe<Scalars['Float']['input']>;
  prefixBoost?: InputMaybe<Scalars['Float']['input']>;
  reviewCount?: InputMaybe<Scalars['Float']['input']>;
  rrfK?: InputMaybe<Scalars['Int']['input']>;
  soldCount?: InputMaybe<Scalars['Float']['input']>;
  text?: InputMaybe<Scalars['Float']['input']>;
  trigramFallbackThreshold?: InputMaybe<Scalars['Int']['input']>;
  trigramMinSimilarity?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateSearchSynonymInput = {
  expansion?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  terms?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type UpdateTagInput = {
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  tagId: Scalars['String']['input'];
};

export type UpdateUserProfileInput = {
  fullName?: InputMaybe<Scalars['String']['input']>;
  profilePhotoUrl?: InputMaybe<Scalars['String']['input']>;
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
  emailVerified: Scalars['Boolean']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  profilePhotoUrl?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  storeId?: Maybe<Scalars['String']['output']>;
};

export type ValidatePromotionInput = {
  code: Scalars['String']['input'];
  lines?: InputMaybe<Array<ValidatePromotionLineInput>>;
  storeId?: InputMaybe<Scalars['String']['input']>;
  subtotal: Scalars['Float']['input'];
};

export type ValidatePromotionLineInput = {
  productId: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  storeId?: InputMaybe<Scalars['String']['input']>;
  unitPrice: Scalars['Float']['input'];
  variantId?: InputMaybe<Scalars['String']['input']>;
};

export enum VariantRemovalBlockReason {
  HasOpenCarts = 'HAS_OPEN_CARTS',
  HasOrders = 'HAS_ORDERS',
}

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

export type VendorCustomerDetailType = {
  __typename?: 'VendorCustomerDetailType';
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  insights: VendorCustomerStoreInsightsType;
  isVerified: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  phone: Scalars['String']['output'];
};

export type VendorCustomerFavoriteProductSummary = {
  __typename?: 'VendorCustomerFavoriteProductSummary';
  createdAt: Scalars['DateTime']['output'];
  productName: Scalars['String']['output'];
};

export type VendorCustomerStoreInsightsType = {
  __typename?: 'VendorCustomerStoreInsightsType';
  averageOrderValue: Scalars['Float']['output'];
  favoriteCount: Scalars['Int']['output'];
  favoriteProducts: Array<VendorCustomerFavoriteProductSummary>;
  lastOrderAt?: Maybe<Scalars['DateTime']['output']>;
  orderCount: Scalars['Int']['output'];
  recentOrders: Array<AdminCustomerRecentOrder>;
  recentReviews: Array<VendorCustomerStoreReviewSummary>;
  reviewCount: Scalars['Int']['output'];
  totalSpent: Scalars['Float']['output'];
};

export type VendorCustomerStoreReviewSummary = {
  __typename?: 'VendorCustomerStoreReviewSummary';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  productName: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
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

export type VerifyEmailInput = {
  token: Scalars['String']['input'];
};
