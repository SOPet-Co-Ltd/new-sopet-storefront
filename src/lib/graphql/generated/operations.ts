/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type RequestAccountDeletionMutationVariables = Exact<{ [key: string]: never }>;

export type RequestAccountDeletionMutation = { requestAccountDeletion: boolean };

export type ChangeCustomerPhoneMutationVariables = Exact<{
  input: Types.ChangeCustomerPhoneInput;
}>;

export type ChangeCustomerPhoneMutation = {
  changeCustomerPhone: {
    pendingDeletion: boolean | null;
    customer: { id: string; phone: string; email: string | null; fullName: string | null } | null;
    tokens: { accessToken: string; refreshToken: string } | null;
  };
};

export type SavedAddressFieldsFragment = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  amphoe: string;
  tumbon: string | null;
  province: string;
  postalCode: string;
  label: string | null;
  isDefault: boolean;
};

export type AddressesQueryVariables = Exact<{ [key: string]: never }>;

export type AddressesQuery = {
  addresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    amphoe: string;
    tumbon: string | null;
    province: string;
    postalCode: string;
    label: string | null;
    isDefault: boolean;
  }>;
};

export type CreateAddressMutationVariables = Exact<{
  input: Types.CreateAddressInput;
}>;

export type CreateAddressMutation = {
  createAddress: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    amphoe: string;
    tumbon: string | null;
    province: string;
    postalCode: string;
    label: string | null;
    isDefault: boolean;
  };
};

export type UpdateAddressMutationVariables = Exact<{
  id: string;
  input: Types.UpdateAddressInput;
}>;

export type UpdateAddressMutation = {
  updateAddress: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    amphoe: string;
    tumbon: string | null;
    province: string;
    postalCode: string;
    label: string | null;
    isDefault: boolean;
  };
};

export type DeleteAddressMutationVariables = Exact<{
  id: string;
}>;

export type DeleteAddressMutation = { deleteAddress: boolean };

export type SetDefaultAddressMutationVariables = Exact<{
  id: string;
}>;

export type SetDefaultAddressMutation = {
  setDefaultAddress: {
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    amphoe: string;
    tumbon: string | null;
    province: string;
    postalCode: string;
    label: string | null;
    isDefault: boolean;
  };
};

export type RefreshTokenMutationVariables = Exact<{
  input: Types.RefreshTokenInput;
}>;

export type RefreshTokenMutation = { refreshToken: { accessToken: string; refreshToken: string } };

export type SendCustomerOtpMutationVariables = Exact<{
  input: Types.SendCustomerOtpInput;
}>;

export type SendCustomerOtpMutation = { sendCustomerOtp: { message: string } };

export type VerifyCustomerOtpMutationVariables = Exact<{
  input: Types.VerifyCustomerOtpInput;
}>;

export type VerifyCustomerOtpMutation = {
  verifyCustomerOtp: {
    pendingDeletion: boolean | null;
    reactivationToken: string | null;
    customer: { id: string; phone: string; email: string | null; fullName: string | null } | null;
    tokens: { accessToken: string; refreshToken: string } | null;
  };
};

export type ReactivateAccountMutationVariables = Exact<{
  input: Types.ReactivateAccountInput;
}>;

export type ReactivateAccountMutation = {
  reactivateAccount: {
    pendingDeletion: boolean | null;
    customer: { id: string; phone: string; email: string | null; fullName: string | null } | null;
    tokens: { accessToken: string; refreshToken: string } | null;
  };
};

export type CartItemFieldsFragment = {
  id: string;
  quantity: number;
  variantId: string;
  productVariant: {
    id: string;
    price: number;
    sku: string;
    optionsJson: string | null;
    product: {
      id: string;
      name: string;
      slug: string;
      storeId: string;
      thumbnailUrl: string | null;
      store: { id: string; name: string; slug: string } | null;
    } | null;
  } | null;
};

export type CartFieldsFragment = {
  id: string;
  sessionId: string | null;
  customerId: string | null;
  items: Array<{
    id: string;
    quantity: number;
    variantId: string;
    productVariant: {
      id: string;
      price: number;
      sku: string;
      optionsJson: string | null;
      product: {
        id: string;
        name: string;
        slug: string;
        storeId: string;
        thumbnailUrl: string | null;
        store: { id: string; name: string; slug: string } | null;
      } | null;
    } | null;
  }>;
};

export type CartQueryVariables = Exact<{
  sessionId?: string | null | undefined;
}>;

export type CartQuery = {
  cart: {
    id: string;
    sessionId: string | null;
    customerId: string | null;
    items: Array<{
      id: string;
      quantity: number;
      variantId: string;
      productVariant: {
        id: string;
        price: number;
        sku: string;
        optionsJson: string | null;
        product: {
          id: string;
          name: string;
          slug: string;
          storeId: string;
          thumbnailUrl: string | null;
          store: { id: string; name: string; slug: string } | null;
        } | null;
      } | null;
    }>;
  };
};

export type AddToCartMutationVariables = Exact<{
  input: Types.AddToCartInput;
}>;

export type AddToCartMutation = {
  addToCart: {
    id: string;
    sessionId: string | null;
    customerId: string | null;
    items: Array<{
      id: string;
      quantity: number;
      variantId: string;
      productVariant: {
        id: string;
        price: number;
        sku: string;
        optionsJson: string | null;
        product: {
          id: string;
          name: string;
          slug: string;
          storeId: string;
          thumbnailUrl: string | null;
          store: { id: string; name: string; slug: string } | null;
        } | null;
      } | null;
    }>;
  };
};

export type UpdateCartItemMutationVariables = Exact<{
  input: Types.UpdateCartItemInput;
}>;

export type UpdateCartItemMutation = {
  updateCartItem: {
    id: string;
    sessionId: string | null;
    customerId: string | null;
    items: Array<{
      id: string;
      quantity: number;
      variantId: string;
      productVariant: {
        id: string;
        price: number;
        sku: string;
        optionsJson: string | null;
        product: {
          id: string;
          name: string;
          slug: string;
          storeId: string;
          thumbnailUrl: string | null;
          store: { id: string; name: string; slug: string } | null;
        } | null;
      } | null;
    }>;
  };
};

export type RemoveCartItemMutationVariables = Exact<{
  input: Types.RemoveCartItemInput;
}>;

export type RemoveCartItemMutation = {
  removeCartItem: {
    id: string;
    sessionId: string | null;
    customerId: string | null;
    items: Array<{
      id: string;
      quantity: number;
      variantId: string;
      productVariant: {
        id: string;
        price: number;
        sku: string;
        optionsJson: string | null;
        product: {
          id: string;
          name: string;
          slug: string;
          storeId: string;
          thumbnailUrl: string | null;
          store: { id: string; name: string; slug: string } | null;
        } | null;
      } | null;
    }>;
  };
};

export type MergeCartMutationVariables = Exact<{
  sessionId: string;
}>;

export type MergeCartMutation = {
  mergeCart: {
    id: string;
    sessionId: string | null;
    customerId: string | null;
    items: Array<{
      id: string;
      quantity: number;
      variantId: string;
      productVariant: {
        id: string;
        price: number;
        sku: string;
        optionsJson: string | null;
        product: {
          id: string;
          name: string;
          slug: string;
          storeId: string;
          thumbnailUrl: string | null;
          store: { id: string; name: string; slug: string } | null;
        } | null;
      } | null;
    }>;
  };
};

export type ApprovedCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedCategoriesQuery = {
  approvedCategories: Array<{ id: string; name: string; slug: string; imageUrl: string | null }>;
};

export type OrderItemFieldsFragment = {
  id: string;
  variantId: string;
  storeId: string;
  productName: string;
  productId: string | null;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  fulfillmentStatus: string;
  variantOptions: string | null;
};

export type OrderStoreShippingFieldsFragment = {
  storeId: string;
  optionName: string;
  shippingFee: number;
};

export type OrderShippingAddressFieldsFragment = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  amphoe: string;
  tumbon: string | null;
  province: string;
  postalCode: string;
};

export type OrderFieldsFragment = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  guestEmail: string | null;
  guestName: string | null;
  guestPhone: string | null;
  items: Array<{
    id: string;
    variantId: string;
    storeId: string;
    productName: string;
    productId: string | null;
    productImageUrl: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    fulfillmentStatus: string;
    variantOptions: string | null;
  }>;
  storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string | null;
    amphoe: string;
    tumbon: string | null;
    province: string;
    postalCode: string;
  } | null;
};

export type ValidatePromotionQueryVariables = Exact<{
  input: Types.ValidatePromotionInput;
}>;

export type ValidatePromotionQuery = {
  validatePromotion: { code: string; name: string; discountAmount: number };
};

export type CreateOrderMutationVariables = Exact<{
  input: Types.CreateOrderInput;
}>;

export type CreateOrderMutation = {
  createOrder: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    paymentMethod: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    total: number;
    guestEmail: string | null;
    guestName: string | null;
    guestPhone: string | null;
    items: Array<{
      id: string;
      variantId: string;
      storeId: string;
      productName: string;
      productId: string | null;
      productImageUrl: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      fulfillmentStatus: string;
      variantOptions: string | null;
    }>;
    storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
    shippingAddress: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string | null;
      amphoe: string;
      tumbon: string | null;
      province: string;
      postalCode: string;
    } | null;
  };
};

export type CreatePaymentMutationVariables = Exact<{
  input: Types.CreatePaymentInput;
}>;

export type CreatePaymentMutation = {
  createPayment: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    authorizeUri: string | null;
    qrCodeUrl: string | null;
    expiresAt: string | null;
  };
};

export type FavoriteProductFieldsFragment = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  thumbnailUrl: string | null;
  images: Array<{ id: string; imageUrl: string; sortOrder: number }> | null;
};

export type FavoritesQueryVariables = Exact<{ [key: string]: never }>;

export type FavoritesQuery = {
  favorites: Array<{
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      thumbnailUrl: string | null;
      images: Array<{ id: string; imageUrl: string; sortOrder: number }> | null;
    } | null;
  }>;
};

export type AddFavoriteMutationVariables = Exact<{
  input: Types.FavoriteProductInput;
}>;

export type AddFavoriteMutation = {
  addFavorite: {
    id: string;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      thumbnailUrl: string | null;
      images: Array<{ id: string; imageUrl: string; sortOrder: number }> | null;
    } | null;
  };
};

export type RemoveFavoriteMutationVariables = Exact<{
  input: Types.FavoriteProductInput;
}>;

export type RemoveFavoriteMutation = { removeFavorite: boolean };

export type ProductCardFieldsFragment = {
  id: string;
  name: string;
  slug: string;
  storeId: string;
  basePrice: number;
  compareAtPrice: number | null;
  thumbnailUrl: string | null;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  variants: Array<{ id: string; price: number }> | null;
};

export type HealthQueryVariables = Exact<{ [key: string]: never }>;

export type HealthQuery = { health: { status: string; api: string; timestamp: string } };

export type LatestPurchaseProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;

export type LatestPurchaseProductsQuery = {
  latestPurchaseProducts: Array<{
    id: string;
    name: string;
    slug: string;
    storeId: string;
    basePrice: number;
    compareAtPrice: number | null;
    thumbnailUrl: string | null;
    averageRating: number;
    reviewCount: number;
    soldCount: number;
    variants: Array<{ id: string; price: number }> | null;
  }>;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  me: {
    customer: {
      id: string;
      phone: string;
      email: string | null;
      fullName: string | null;
      profilePhotoUrl: string | null;
      dateOfBirth: string | null;
    } | null;
  };
};

export type NotificationsQueryVariables = Exact<{
  unreadOnly?: boolean | null | undefined;
}>;

export type NotificationsQuery = {
  notifications: Array<{
    id: string;
    type: string;
    title: string | null;
    message: string;
    metadata: string | null;
    isRead: boolean;
    createdAt: string;
  }>;
};

export type UnreadCountQueryVariables = Exact<{ [key: string]: never }>;

export type UnreadCountQuery = { unreadNotificationsCount: number };

export type MarkNotificationReadMutationVariables = Exact<{
  id: string;
}>;

export type MarkNotificationReadMutation = { markNotificationRead: boolean };

export type MarkAllNotificationsReadMutationVariables = Exact<{ [key: string]: never }>;

export type MarkAllNotificationsReadMutation = { markAllNotificationsRead: boolean };

export type OrderTrackingFieldsFragment = {
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  items: Array<{
    storeId: string;
    productId: string | null;
    productName: string;
    productImageUrl: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    fulfillmentStatus: string;
    trackingNumber: string | null;
    fulfillmentProvider: string | null;
    trackingUrl: string | null;
    variantOptions: string | null;
  }>;
  storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
};

export type OrderTrackingQueryVariables = Exact<{
  orderNumber: string;
}>;

export type OrderTrackingQuery = {
  orderTracking: {
    orderNumber: string;
    status: string;
    createdAt: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    total: number;
    items: Array<{
      storeId: string;
      productId: string | null;
      productName: string;
      productImageUrl: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      fulfillmentStatus: string;
      trackingNumber: string | null;
      fulfillmentProvider: string | null;
      trackingUrl: string | null;
      variantOptions: string | null;
    }>;
    storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
  };
};

export type OrderListFieldsFragment = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  items: Array<{ id: string; productName: string; quantity: number }>;
};

export type OrderConfirmationFieldsFragment = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  items: Array<{
    id: string;
    variantId: string;
    storeId: string;
    productName: string;
    productId: string | null;
    productImageUrl: string | null;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    fulfillmentStatus: string;
    trackingNumber: string | null;
    fulfillmentProvider: string | null;
    trackingUrl: string | null;
    variantOptions: string | null;
  }>;
  storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
};

export type OrdersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
  filter?: Types.CustomerOrderListFilter | null | undefined;
}>;

export type OrdersQuery = {
  orders: {
    items: Array<{
      id: string;
      orderNumber: string;
      status: string;
      createdAt: string;
      total: number;
      items: Array<{ id: string; productName: string; quantity: number }>;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
};

export type OrderQueryVariables = Exact<{
  id: string;
}>;

export type OrderQuery = {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    items: Array<{
      id: string;
      variantId: string;
      storeId: string;
      productName: string;
      productId: string | null;
      productImageUrl: string | null;
      unitPrice: number;
      quantity: number;
      subtotal: number;
      fulfillmentStatus: string;
      trackingNumber: string | null;
      fulfillmentProvider: string | null;
      trackingUrl: string | null;
      variantOptions: string | null;
    }>;
    storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
  };
};

export type ConfirmOrderDeliveredMutationVariables = Exact<{
  input: Types.ConfirmOrderDeliveredInput;
}>;

export type ConfirmOrderDeliveredMutation = {
  confirmOrderDelivered: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    total: number;
    paymentMethod: string;
    items: Array<{
      id: string;
      variantId: string;
      storeId: string;
      productName: string;
      productId: string | null;
      productImageUrl: string | null;
      unitPrice: number;
      quantity: number;
      subtotal: number;
      fulfillmentStatus: string;
      trackingNumber: string | null;
      fulfillmentProvider: string | null;
      trackingUrl: string | null;
      variantOptions: string | null;
    }>;
    storeShippings: Array<{ storeId: string; optionName: string; shippingFee: number }>;
  };
};

export type PaymentFieldsFragment = {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  authorizeUri: string | null;
  qrCodeUrl: string | null;
  expiresAt: string | null;
};

export type PaymentQueryVariables = Exact<{
  id: string;
}>;

export type PaymentQuery = {
  payment: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    authorizeUri: string | null;
    qrCodeUrl: string | null;
    expiresAt: string | null;
  };
};

export type PaymentByOrderIdQueryVariables = Exact<{
  orderId: string;
}>;

export type PaymentByOrderIdQuery = {
  paymentByOrderId: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    authorizeUri: string | null;
    qrCodeUrl: string | null;
    expiresAt: string | null;
  };
};

export type PaymentStatusUpdatedSubscriptionVariables = Exact<{
  paymentId?: string | null | undefined;
  orderId?: string | null | undefined;
}>;

export type PaymentStatusUpdatedSubscription = {
  paymentStatusUpdated: {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    authorizeUri: string | null;
    qrCodeUrl: string | null;
    expiresAt: string | null;
  };
};

export type SavedPaymentMethodFieldsFragment = {
  id: string;
  type: string;
  lastFour: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
};

export type PaymentMethodsQueryVariables = Exact<{ [key: string]: never }>;

export type PaymentMethodsQuery = {
  paymentMethods: Array<{
    id: string;
    type: string;
    lastFour: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }>;
};

export type AddPaymentMethodMutationVariables = Exact<{
  input: Types.AddPaymentMethodInput;
}>;

export type AddPaymentMethodMutation = {
  addPaymentMethod: {
    id: string;
    type: string;
    lastFour: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  };
};

export type DeletePaymentMethodMutationVariables = Exact<{
  id: string;
}>;

export type DeletePaymentMethodMutation = { deletePaymentMethod: boolean };

export type SetDefaultPaymentMethodMutationVariables = Exact<{
  id: string;
}>;

export type SetDefaultPaymentMethodMutation = {
  setDefaultPaymentMethod: {
    id: string;
    type: string;
    lastFour: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  };
};

export type PlatformBannersQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformBannersQuery = {
  platformBanners: Array<{
    id: string;
    title: string;
    imageUrl: string;
    mobileImageUrl: string | null;
    linkUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>;
};

export type PlatformAdsQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformAdsQuery = {
  platformAds: Array<{
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>;
};

export type PlatformSponsorsQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformSponsorsQuery = {
  platformSponsors: Array<{
    id: string;
    name: string;
    imageUrl: string;
    linkUrl: string | null;
    sortOrder: number;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
  }>;
};

export type PlatformSettingsQueryVariables = Exact<{ [key: string]: never }>;

export type PlatformSettingsQuery = {
  platformSettings: { currency: string; storefrontUrl: string; supportEmail: string };
};

export type ProductDetailFieldsFragment = {
  id: string;
  slug: string;
  storeId: string;
  name: string;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  thumbnailUrl: string | null;
  averageRating: number;
  reviewCount: number;
  soldCount: number;
  status: string;
  category: string | null;
  tags: Array<string>;
  warning: string | null;
  expiryDate: string | null;
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
  } | null;
  images: Array<{ id: string; imageUrl: string; isThumbnail: boolean; sortOrder: number }> | null;
  variants: Array<{
    id: string;
    sku: string;
    price: number;
    stockQuantity: number;
    optionsJson: string | null;
  }> | null;
};

export type ProductBySlugQueryVariables = Exact<{
  slug: string;
  storeId: string;
}>;

export type ProductBySlugQuery = {
  productBySlug: {
    id: string;
    slug: string;
    storeId: string;
    name: string;
    description: string | null;
    basePrice: number;
    compareAtPrice: number | null;
    thumbnailUrl: string | null;
    averageRating: number;
    reviewCount: number;
    soldCount: number;
    status: string;
    category: string | null;
    tags: Array<string>;
    warning: string | null;
    expiryDate: string | null;
    store: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      bannerUrl: string | null;
      description: string | null;
    } | null;
    images: Array<{ id: string; imageUrl: string; isThumbnail: boolean; sortOrder: number }> | null;
    variants: Array<{
      id: string;
      sku: string;
      price: number;
      stockQuantity: number;
      optionsJson: string | null;
    }> | null;
  };
};

export type ProductByIdQueryVariables = Exact<{
  id: string;
}>;

export type ProductByIdQuery = {
  product: {
    id: string;
    slug: string;
    storeId: string;
    name: string;
    description: string | null;
    basePrice: number;
    compareAtPrice: number | null;
    thumbnailUrl: string | null;
    averageRating: number;
    reviewCount: number;
    soldCount: number;
    status: string;
    category: string | null;
    tags: Array<string>;
    warning: string | null;
    expiryDate: string | null;
    store: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
      bannerUrl: string | null;
      description: string | null;
    } | null;
    images: Array<{ id: string; imageUrl: string; isThumbnail: boolean; sortOrder: number }> | null;
    variants: Array<{
      id: string;
      sku: string;
      price: number;
      stockQuantity: number;
      optionsJson: string | null;
    }> | null;
  };
};

export type ProductsQueryVariables = Exact<{
  category?: string | null | undefined;
  page?: number | null | undefined;
  limit?: number | null | undefined;
  search?: string | null | undefined;
  storeId?: string | null | undefined;
  tag?: string | null | undefined;
  petTypeIds?: Array<string> | string | null | undefined;
  brandIds?: Array<string> | string | null | undefined;
  minPrice?: number | null | undefined;
  maxPrice?: number | null | undefined;
  sortBy?: string | null | undefined;
  sortOrder?: string | null | undefined;
  sessionId?: string | null | undefined;
  searchContext?: Types.SearchContextInput | null | undefined;
}>;

export type ProductsQuery = {
  products: {
    items: Array<{
      id: string;
      name: string;
      slug: string;
      storeId: string;
      basePrice: number;
      compareAtPrice: number | null;
      thumbnailUrl: string | null;
      averageRating: number;
      reviewCount: number;
      soldCount: number;
      store: { id: string; name: string; slug: string } | null;
      variants: Array<{ id: string; price: number }> | null;
    }>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
};

export type UpdateProfileMutationVariables = Exact<{
  input: Types.UpdateProfileInput;
}>;

export type UpdateProfileMutation = {
  updateProfile: {
    id: string;
    phone: string;
    email: string | null;
    fullName: string | null;
    profilePhotoUrl: string | null;
    dateOfBirth: string | null;
  };
};

export type StorePromotionFieldsFragment = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: string;
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  expiresAt: string | null;
  scope: string;
  storeId: string | null;
  conditions: string | null;
};

export type ActiveStorePromotionsQueryVariables = Exact<{
  storeId: string;
}>;

export type ActiveStorePromotionsQuery = {
  activeStorePromotions: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: string;
    discountValue: number;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    expiresAt: string | null;
    scope: string;
    storeId: string | null;
    conditions: string | null;
  }>;
};

export type ActivePlatformPromotionsQueryVariables = Exact<{ [key: string]: never }>;

export type ActivePlatformPromotionsQuery = {
  activePlatformPromotions: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    type: string;
    discountValue: number;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    expiresAt: string | null;
    scope: string;
    storeId: string | null;
    conditions: string | null;
  }>;
};

export type RecommendedProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
  sessionId?: string | null | undefined;
  searchContext?: Types.SearchContextInput | null | undefined;
  excludeProductIds?: Array<string> | string | null | undefined;
  shuffleSeed?: string | null | undefined;
}>;

export type RecommendedProductsQuery = {
  recommendedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    storeId: string;
    basePrice: number;
    compareAtPrice: number | null;
    thumbnailUrl: string | null;
    averageRating: number;
    reviewCount: number;
    soldCount: number;
    variants: Array<{ id: string; price: number }> | null;
  }>;
};

export type ProductReviewsQueryVariables = Exact<{
  productId: string;
}>;

export type ProductReviewsQuery = {
  productReviews: Array<{
    id: string;
    productId: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: string;
    customerName: string;
    images: Array<{ id: string; url: string }>;
    reply: { id: string; body: string; createdAt: string; updatedAt: string } | null;
  }>;
};

export type StoreReviewsQueryVariables = Exact<{
  storeId: string;
}>;

export type StoreReviewsQuery = {
  storeReviews: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string | null;
    productImageUrl: string | null;
    rating: number;
    comment: string | null;
    createdAt: string;
    customerName: string;
    images: Array<{ id: string; url: string }>;
    reply: { id: string; body: string; createdAt: string; updatedAt: string } | null;
  }>;
};

export type StoreReviewSummaryQueryVariables = Exact<{
  storeId: string;
}>;

export type StoreReviewSummaryQuery = {
  storeReviewSummary: {
    averageRating: number;
    totalCount: number;
    productBreakdown: Array<{
      productId: string;
      productName: string;
      averageRating: number;
      reviewCount: number;
    }>;
  };
};

export type CreateReviewMutationVariables = Exact<{
  input: Types.CreateReviewInput;
}>;

export type CreateReviewMutation = {
  createReview: {
    id: string;
    productId: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: string;
    customerName: string;
    images: Array<{ id: string; url: string }>;
  };
};

export type CustomerReviewableItemsQueryVariables = Exact<{ [key: string]: never }>;

export type CustomerReviewableItemsQuery = {
  customerReviewableItems: Array<{
    orderId: string;
    orderNumber: string;
    orderItemId: string;
    productId: string;
    productName: string;
    productSlug: string | null;
    productImageUrl: string | null;
    deliveredAt: string;
    reviewDeadline: string | null;
  }>;
};

export type MyReviewsQueryVariables = Exact<{
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;

export type MyReviewsQuery = {
  myReviews: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string | null;
    productImageUrl: string | null;
    orderId: string;
    rating: number;
    comment: string | null;
    status: string;
    createdAt: string;
    images: Array<{ id: string; url: string }>;
  }>;
};

export type SearchSuggestionsQueryVariables = Exact<{
  query: string;
  limit?: number | null | undefined;
  sessionId?: string | null | undefined;
}>;

export type SearchSuggestionsQuery = {
  searchSuggestions: {
    products: Array<{ id: string; name: string; slug: string; thumbnailUrl: string | null }>;
    queries: Array<{ query: string }>;
  };
};

export type SearchRecoverySuggestionsQueryVariables = Exact<{
  query: string;
}>;

export type SearchRecoverySuggestionsQuery = { searchRecoverySuggestions: Array<string> };

export type StoreShippingOptionFieldsFragment = {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  sortOrder: number;
  providerId: string | null;
};

export type StoreShippingOptionsQueryVariables = Exact<{
  storeId: string;
}>;

export type StoreShippingOptionsQuery = {
  storeShippingOptions: Array<{
    id: string;
    storeId: string;
    name: string;
    description: string | null;
    price: number;
    isActive: boolean;
    sortOrder: number;
    providerId: string | null;
  }>;
};

export type StoreFieldsFragment = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  status: string;
};

export type StoreQueryVariables = Exact<{
  id: string;
}>;

export type StoreQuery = {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    status: string;
  };
};

export type StoreBySlugQueryVariables = Exact<{
  slug: string;
}>;

export type StoreBySlugQuery = {
  storeBySlug: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    status: string;
  };
};

export type StoresQueryVariables = Exact<{ [key: string]: never }>;

export type StoresQuery = {
  stores: Array<{
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    status: string;
  }>;
};

export type ApprovedPetTypesQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedPetTypesQuery = { approvedPetTypes: Array<{ id: string; name: string }> };

export type ApprovedBrandsQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedBrandsQuery = { approvedBrands: Array<{ id: string; name: string }> };

export type ApprovedTagsQueryVariables = Exact<{ [key: string]: never }>;

export type ApprovedTagsQuery = { approvedTags: Array<{ id: string; name: string; slug: string }> };

export type UploadImageMutationVariables = Exact<{
  base64: string;
  folder?: string | null | undefined;
}>;

export type UploadImageMutation = { uploadImage: { url: string; key: string } };

export const SavedAddressFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'SavedAddressFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SavedAddressType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
          { kind: 'Field', name: { kind: 'Name', value: 'addressLine1' } },
          { kind: 'Field', name: { kind: 'Name', value: 'addressLine2' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amphoe' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tumbon' } },
          { kind: 'Field', name: { kind: 'Name', value: 'province' } },
          { kind: 'Field', name: { kind: 'Name', value: 'postalCode' } },
          { kind: 'Field', name: { kind: 'Name', value: 'label' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isDefault' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SavedAddressFieldsFragment, unknown>;
export const CartItemFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CartItemFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CartItemType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variantId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'productVariant' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sku' } },
                { kind: 'Field', name: { kind: 'Name', value: 'optionsJson' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'product' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'thumbnailUrl' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'store' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CartItemFieldsFragment, unknown>;
export const CartFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CartFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CartType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sessionId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'customerId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CartItemFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CartItemFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CartItemType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variantId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'productVariant' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sku' } },
                { kind: 'Field', name: { kind: 'Name', value: 'optionsJson' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'product' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'thumbnailUrl' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'store' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CartFieldsFragment, unknown>;
export const OrderItemFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderItemFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderItemType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variantId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitPrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fulfillmentStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variantOptions' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderItemFieldsFragment, unknown>;
export const OrderStoreShippingFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderStoreShippingFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderStoreShippingType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'optionName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderStoreShippingFieldsFragment, unknown>;
export const OrderShippingAddressFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderShippingAddressFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'OrderShippingAddressType' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
          { kind: 'Field', name: { kind: 'Name', value: 'addressLine1' } },
          { kind: 'Field', name: { kind: 'Name', value: 'addressLine2' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amphoe' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tumbon' } },
          { kind: 'Field', name: { kind: 'Name', value: 'province' } },
          { kind: 'Field', name: { kind: 'Name', value: 'postalCode' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderShippingAddressFieldsFragment, unknown>;
export const OrderFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'orderNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paymentMethod' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
          { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'total' } },
          { kind: 'Field', name: { kind: 'Name', value: 'guestEmail' } },
          { kind: 'Field', name: { kind: 'Name', value: 'guestName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'guestPhone' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OrderItemFields' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeShippings' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'OrderStoreShippingFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shippingAddress' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'OrderShippingAddressFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderItemFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderItemType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variantId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitPrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
          { kind: 'Field', name: { kind: 'Name', value: 'fulfillmentStatus' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variantOptions' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderStoreShippingFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderStoreShippingType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'optionName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderShippingAddressFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'OrderShippingAddressType' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
          { kind: 'Field', name: { kind: 'Name', value: 'addressLine1' } },
          { kind: 'Field', name: { kind: 'Name', value: 'addressLine2' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amphoe' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tumbon' } },
          { kind: 'Field', name: { kind: 'Name', value: 'province' } },
          { kind: 'Field', name: { kind: 'Name', value: 'postalCode' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderFieldsFragment, unknown>;
export const FavoriteProductFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'FavoriteProductFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ProductType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'basePrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'thumbnailUrl' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'images' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sortOrder' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FavoriteProductFieldsFragment, unknown>;
export const ProductCardFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ProductCardFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ProductType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'basePrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'compareAtPrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'thumbnailUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'soldCount' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'variants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'price' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductCardFieldsFragment, unknown>;
export const OrderTrackingFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderTrackingFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderTrackingType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'orderNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
          { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'total' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unitPrice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fulfillmentStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackingNumber' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fulfillmentProvider' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackingUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variantOptions' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeShippings' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'optionName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderTrackingFieldsFragment, unknown>;
export const OrderListFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderListFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'orderNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'total' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderListFieldsFragment, unknown>;
export const OrderConfirmationFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OrderConfirmationFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OrderType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'orderNumber' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
          { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'total' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paymentMethod' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variantId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unitPrice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'subtotal' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fulfillmentStatus' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackingNumber' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fulfillmentProvider' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackingUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variantOptions' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeShippings' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'optionName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'shippingFee' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderConfirmationFieldsFragment, unknown>;
export const PaymentFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PaymentType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'orderId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'currency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paymentMethod' } },
          { kind: 'Field', name: { kind: 'Name', value: 'authorizeUri' } },
          { kind: 'Field', name: { kind: 'Name', value: 'qrCodeUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PaymentFieldsFragment, unknown>;
export const SavedPaymentMethodFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'SavedPaymentMethodFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'SavedPaymentMethodType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastFour' } },
          { kind: 'Field', name: { kind: 'Name', value: 'brand' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiryMonth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiryYear' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isDefault' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SavedPaymentMethodFieldsFragment, unknown>;
export const ProductDetailFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ProductDetailFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'ProductType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'basePrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'compareAtPrice' } },
          { kind: 'Field', name: { kind: 'Name', value: 'thumbnailUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'soldCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'warning' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiryDate' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'store' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'logoUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bannerUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'images' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isThumbnail' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sortOrder' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'variants' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sku' } },
                { kind: 'Field', name: { kind: 'Name', value: 'price' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stockQuantity' } },
                { kind: 'Field', name: { kind: 'Name', value: 'optionsJson' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductDetailFieldsFragment, unknown>;
export const StorePromotionFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'StorePromotionFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'PromotionType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'code' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'discountValue' } },
          { kind: 'Field', name: { kind: 'Name', value: 'minPurchaseAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'maxDiscountAmount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'scope' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'conditions' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StorePromotionFieldsFragment, unknown>;
export const StoreShippingOptionFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'StoreShippingOptionFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'StoreShippingOptionType' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storeId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'price' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sortOrder' } },
          { kind: 'Field', name: { kind: 'Name', value: 'providerId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreShippingOptionFieldsFragment, unknown>;
export const StoreFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'StoreFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'StoreType' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
          { kind: 'Field', name: { kind: 'Name', value: 'logoUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bannerUrl' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreFieldsFragment, unknown>;
export const RequestAccountDeletionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RequestAccountDeletion' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'requestAccountDeletion' } }],
      },
    },
  ],
} as unknown as DocumentNode<
  RequestAccountDeletionMutation,
  RequestAccountDeletionMutationVariables
>;
export const ChangeCustomerPhoneDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ChangeCustomerPhone' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ChangeCustomerPhoneInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changeCustomerPhone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingDeletion' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tokens' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'refreshToken' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ChangeCustomerPhoneMutation, ChangeCustomerPhoneMutationVariables>;
export const AddressesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Addresses' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addresses' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SavedAddressFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddressesQuery, AddressesQueryVariables>;
export const CreateAddressDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateAddress' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateAddressInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAddress' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SavedAddressFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateAddressMutation, CreateAddressMutationVariables>;
export const UpdateAddressDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAddress' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateAddressInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAddress' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SavedAddressFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateAddressMutation, UpdateAddressMutationVariables>;
export const DeleteAddressDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteAddress' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAddress' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteAddressMutation, DeleteAddressMutationVariables>;
export const SetDefaultAddressDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetDefaultAddress' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setDefaultAddress' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'SavedAddressFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SetDefaultAddressMutation, SetDefaultAddressMutationVariables>;
export const RefreshTokenDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RefreshToken' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'RefreshTokenInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'refreshToken' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                { kind: 'Field', name: { kind: 'Name', value: 'refreshToken' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const SendCustomerOtpDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SendCustomerOtp' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SendCustomerOtpInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendCustomerOtp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'message' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SendCustomerOtpMutation, SendCustomerOtpMutationVariables>;
export const VerifyCustomerOtpDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'VerifyCustomerOtp' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'VerifyCustomerOtpInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'verifyCustomerOtp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingDeletion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reactivationToken' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tokens' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'refreshToken' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<VerifyCustomerOtpMutation, VerifyCustomerOtpMutationVariables>;
export const ReactivateAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ReactivateAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ReactivateAccountInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'reactivateAccount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'pendingDeletion' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tokens' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'refreshToken' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReactivateAccountMutation, ReactivateAccountMutationVariables>;
export const CartDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Cart' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'cart' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sessionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CartFields' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CartQuery, CartQueryVariables>;
export const AddToCartDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddToCart' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AddToCartInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addToCart' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CartFields' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCartItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateCartItemInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCartItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CartFields' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveCartItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveCartItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'RemoveCartItemInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeCartItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CartFields' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveCartItemMutation, RemoveCartItemMutationVariables>;
export const MergeCartDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MergeCart' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mergeCart' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sessionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'CartFields' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MergeCartMutation, MergeCartMutationVariables>;
export const ApprovedCategoriesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedCategories' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedCategories' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedCategoriesQuery, ApprovedCategoriesQueryVariables>;
export const ValidatePromotionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ValidatePromotion' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ValidatePromotionInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'validatePromotion' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'code' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'discountAmount' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ValidatePromotionQuery, ValidatePromotionQueryVariables>;
export const CreateOrderDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateOrder' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateOrderInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createOrder' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OrderFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateOrderMutation, CreateOrderMutationVariables>;
export const CreatePaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreatePayment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreatePaymentInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createPayment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaymentFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePaymentMutation, CreatePaymentMutationVariables>;
export const FavoritesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Favorites' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'favorites' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'product' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'FavoriteProductFields' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<FavoritesQuery, FavoritesQueryVariables>;
export const AddFavoriteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddFavorite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'FavoriteProductInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addFavorite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'product' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'FavoriteProductFields' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddFavoriteMutation, AddFavoriteMutationVariables>;
export const RemoveFavoriteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveFavorite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'FavoriteProductInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeFavorite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RemoveFavoriteMutation, RemoveFavoriteMutationVariables>;
export const HealthDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Health' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'health' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'api' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>;
export const LatestPurchaseProductsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'LatestPurchaseProducts' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'latestPurchaseProducts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ProductCardFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LatestPurchaseProductsQuery, LatestPurchaseProductsQueryVariables>;
export const MeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Me' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'me' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'customer' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'profilePhotoUrl' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'dateOfBirth' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const NotificationsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Notifications' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'unreadOnly' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'notifications' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'unreadOnly' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'unreadOnly' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isRead' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<NotificationsQuery, NotificationsQueryVariables>;
export const UnreadCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UnreadCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'unreadNotificationsCount' } }],
      },
    },
  ],
} as unknown as DocumentNode<UnreadCountQuery, UnreadCountQueryVariables>;
export const MarkNotificationReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkNotificationRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markNotificationRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MarkNotificationReadMutation, MarkNotificationReadMutationVariables>;
export const MarkAllNotificationsReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkAllNotificationsRead' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [{ kind: 'Field', name: { kind: 'Name', value: 'markAllNotificationsRead' } }],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkAllNotificationsReadMutation,
  MarkAllNotificationsReadMutationVariables
>;
export const OrderTrackingDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'OrderTracking' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderNumber' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'orderTracking' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderNumber' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderNumber' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OrderTrackingFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderTrackingQuery, OrderTrackingQueryVariables>;
export const OrdersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Orders' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'CustomerOrderListFilter' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'orders' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'page' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'filter' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OrderListFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pagination' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'page' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'limit' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'total' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'totalPages' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrdersQuery, OrdersQueryVariables>;
export const OrderDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Order' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'order' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'OrderConfirmationFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<OrderQuery, OrderQueryVariables>;
export const ConfirmOrderDeliveredDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ConfirmOrderDelivered' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ConfirmOrderDeliveredInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'confirmOrderDelivered' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'OrderConfirmationFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ConfirmOrderDeliveredMutation, ConfirmOrderDeliveredMutationVariables>;
export const PaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Payment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'payment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaymentFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PaymentQuery, PaymentQueryVariables>;
export const PaymentByOrderIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PaymentByOrderId' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'paymentByOrderId' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaymentFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PaymentByOrderIdQuery, PaymentByOrderIdQueryVariables>;
export const PaymentStatusUpdatedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'PaymentStatusUpdated' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'paymentId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'orderId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'paymentStatusUpdated' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'paymentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'paymentId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'orderId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'orderId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaymentFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PaymentStatusUpdatedSubscription,
  PaymentStatusUpdatedSubscriptionVariables
>;
export const PaymentMethodsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PaymentMethods' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'paymentMethods' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'SavedPaymentMethodFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PaymentMethodsQuery, PaymentMethodsQueryVariables>;
export const AddPaymentMethodDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddPaymentMethod' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'AddPaymentMethodInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addPaymentMethod' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'SavedPaymentMethodFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddPaymentMethodMutation, AddPaymentMethodMutationVariables>;
export const DeletePaymentMethodDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePaymentMethod' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePaymentMethod' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePaymentMethodMutation, DeletePaymentMethodMutationVariables>;
export const SetDefaultPaymentMethodDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetDefaultPaymentMethod' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setDefaultPaymentMethod' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'SavedPaymentMethodFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetDefaultPaymentMethodMutation,
  SetDefaultPaymentMethodMutationVariables
>;
export const PlatformBannersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PlatformBanners' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'platformBanners' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobileImageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'linkUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sortOrder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'endsAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlatformBannersQuery, PlatformBannersQueryVariables>;
export const PlatformAdsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PlatformAds' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'platformAds' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'linkUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sortOrder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'endsAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlatformAdsQuery, PlatformAdsQueryVariables>;
export const PlatformSponsorsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PlatformSponsors' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'platformSponsors' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'imageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'linkUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sortOrder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
                { kind: 'Field', name: { kind: 'Name', value: 'startsAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'endsAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlatformSponsorsQuery, PlatformSponsorsQueryVariables>;
export const PlatformSettingsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PlatformSettings' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'platformSettings' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'currency' } },
                { kind: 'Field', name: { kind: 'Name', value: 'storefrontUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportEmail' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlatformSettingsQuery, PlatformSettingsQueryVariables>;
export const ProductBySlugDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ProductBySlug' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'slug' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'productBySlug' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'slug' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'slug' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ProductDetailFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductBySlugQuery, ProductBySlugQueryVariables>;
export const ProductByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ProductById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'product' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ProductDetailFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductByIdQuery, ProductByIdQueryVariables>;
export const ProductsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Products' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'category' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'search' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'tag' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'petTypeIds' } },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'brandIds' } },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'minPrice' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'maxPrice' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sortBy' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sortOrder' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'searchContext' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'SearchContextInput' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'products' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'category' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'category' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'page' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'search' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'tag' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'tag' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'petTypeIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'petTypeIds' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'brandIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'brandIds' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'minPrice' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'minPrice' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'maxPrice' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'maxPrice' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sortBy' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sortBy' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sortOrder' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sortOrder' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sessionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'searchContext' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'searchContext' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'ProductCardFields' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'store' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pagination' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'page' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'limit' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'total' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'totalPages' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const UpdateProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateProfileInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'phone' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'fullName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'profilePhotoUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dateOfBirth' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ActiveStorePromotionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ActiveStorePromotions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'activeStorePromotions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'StorePromotionFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ActiveStorePromotionsQuery, ActiveStorePromotionsQueryVariables>;
export const ActivePlatformPromotionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ActivePlatformPromotions' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'activePlatformPromotions' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'StorePromotionFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ActivePlatformPromotionsQuery, ActivePlatformPromotionsQueryVariables>;
export const RecommendedProductsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'RecommendedProducts' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'searchContext' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'SearchContextInput' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'excludeProductIds' } },
          type: {
            kind: 'ListType',
            type: {
              kind: 'NonNullType',
              type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'shuffleSeed' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recommendedProducts' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sessionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'searchContext' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'searchContext' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'excludeProductIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'excludeProductIds' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'shuffleSeed' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'shuffleSeed' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ProductCardFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RecommendedProductsQuery, RecommendedProductsQueryVariables>;
export const ProductReviewsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ProductReviews' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'productId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'productReviews' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'productId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'productId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customerName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'images' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'reply' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProductReviewsQuery, ProductReviewsQueryVariables>;
export const StoreReviewsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StoreReviews' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeReviews' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productSlug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customerName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'images' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'reply' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'body' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreReviewsQuery, StoreReviewsQueryVariables>;
export const StoreReviewSummaryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StoreReviewSummary' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeReviewSummary' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalCount' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'productBreakdown' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'averageRating' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'reviewCount' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreReviewSummaryQuery, StoreReviewSummaryQueryVariables>;
export const CreateReviewDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateReview' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateReviewInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createReview' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'customerName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'images' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateReviewMutation, CreateReviewMutationVariables>;
export const CustomerReviewableItemsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CustomerReviewableItems' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'customerReviewableItems' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'orderId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'orderNumber' } },
                { kind: 'Field', name: { kind: 'Name', value: 'orderItemId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productSlug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'deliveredAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reviewDeadline' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CustomerReviewableItemsQuery, CustomerReviewableItemsQueryVariables>;
export const MyReviewsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyReviews' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myReviews' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'offset' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'offset' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productSlug' } },
                { kind: 'Field', name: { kind: 'Name', value: 'productImageUrl' } },
                { kind: 'Field', name: { kind: 'Name', value: 'orderId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'rating' } },
                { kind: 'Field', name: { kind: 'Name', value: 'comment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'images' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyReviewsQuery, MyReviewsQueryVariables>;
export const SearchSuggestionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchSuggestions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchSuggestions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'limit' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sessionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'sessionId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'products' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'thumbnailUrl' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'queries' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [{ kind: 'Field', name: { kind: 'Name', value: 'query' } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchSuggestionsQuery, SearchSuggestionsQueryVariables>;
export const SearchRecoverySuggestionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchRecoverySuggestions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchRecoverySuggestions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'query' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SearchRecoverySuggestionsQuery,
  SearchRecoverySuggestionsQueryVariables
>;
export const StoreShippingOptionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StoreShippingOptions' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeShippingOptions' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'storeId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'storeId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'StoreShippingOptionFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreShippingOptionsQuery, StoreShippingOptionsQueryVariables>;
export const StoreDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Store' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'store' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'StoreFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreQuery, StoreQueryVariables>;
export const StoreBySlugDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'StoreBySlug' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'slug' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storeBySlug' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'slug' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'slug' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'StoreFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoreBySlugQuery, StoreBySlugQueryVariables>;
export const StoresDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Stores' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'stores' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'StoreFields' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<StoresQuery, StoresQueryVariables>;
export const ApprovedPetTypesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedPetTypes' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedPetTypes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedPetTypesQuery, ApprovedPetTypesQueryVariables>;
export const ApprovedBrandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedBrands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedBrands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedBrandsQuery, ApprovedBrandsQueryVariables>;
export const ApprovedTagsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ApprovedTags' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'approvedTags' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slug' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ApprovedTagsQuery, ApprovedTagsQueryVariables>;
export const UploadImageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UploadImage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'base64' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'folder' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'uploadImage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'base64' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'base64' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'folder' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'folder' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'url' } },
                { kind: 'Field', name: { kind: 'Name', value: 'key' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UploadImageMutation, UploadImageMutationVariables>;
