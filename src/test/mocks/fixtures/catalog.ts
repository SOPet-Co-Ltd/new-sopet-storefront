/** Shared catalog fixture data for MSW handlers and hook integration tests. */

export const CATALOG_STORE_ID = 'c880a541-d7d9-4566-a4a8-73c27e68d2e3';
export const CATALOG_PRODUCT_ID = 'prod-001';

export const sampleProductCard = {
  __typename: 'ProductType' as const,
  id: CATALOG_PRODUCT_ID,
  name: 'Premium Dog Food 5kg',
  slug: 'premium-dog-food-5kg',
  storeId: CATALOG_STORE_ID,
  basePrice: 890,
  compareAtPrice: null,
  thumbnailUrl: 'https://example.com/dog-food.jpg',
  averageRating: 4.5,
  reviewCount: 12,
  soldCount: 48,
  store: {
    __typename: 'StoreType' as const,
    id: CATALOG_STORE_ID,
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
  },
};

export const sampleProductDetail = {
  ...sampleProductCard,
  description: 'High quality dog food',
  status: 'published',
  category: 'dog-food',
  tags: ['dog', 'food'],
  warning: null,
  store: {
    __typename: 'StoreType' as const,
    id: CATALOG_STORE_ID,
    name: 'SOPet Pet Shop',
    slug: 'sopet-pet-shop',
    logoUrl: null,
    bannerUrl: null,
    description: 'Your pet shop',
  },
  images: [],
  variants: [],
};

export const sampleStore = {
  __typename: 'StoreType' as const,
  id: CATALOG_STORE_ID,
  name: 'SOPet Pet Shop',
  slug: 'sopet-pet-shop',
  logoUrl: null,
  bannerUrl: null,
  description: 'Your pet shop',
  status: 'approved',
};

export const sampleCategories = [
  {
    __typename: 'CategoryType' as const,
    id: 'cat-1',
    name: 'Dog Food',
    slug: 'dog-food',
    imageUrl: 'https://example.com/dog-food-category.jpg',
  },
  {
    __typename: 'CategoryType' as const,
    id: 'cat-2',
    name: 'Cat Food',
    slug: 'cat-food',
    imageUrl: 'https://example.com/cat-food-category.jpg',
  },
];

export const sampleProductReview = {
  id: 'review-1',
  productId: CATALOG_PRODUCT_ID,
  rating: 5,
  comment: 'Great product',
  status: 'approved',
  createdAt: '2026-01-01T00:00:00.000Z',
  customerName: 'Test Customer',
  images: [],
};

export const sampleStoreReviewSummary = {
  averageRating: 4.6,
  totalCount: 24,
  productBreakdown: [
    {
      productId: CATALOG_PRODUCT_ID,
      productName: 'Premium Dog Food 5kg',
      averageRating: 4.5,
      reviewCount: 12,
    },
  ],
};

export const samplePlatformBanners = [
  {
    id: 'banner-1',
    title: 'Welcome',
    imageUrl: 'https://example.com/banner.jpg',
    linkUrl: '/categories',
    sortOrder: 1,
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
];

export const samplePlatformAds = [
  {
    id: 'ad-1',
    title: 'Pet Payday Promotion',
    imageUrl: 'https://example.com/promo-ad.jpg',
    linkUrl: '/categories',
    sortOrder: 1,
    isActive: true,
    startsAt: null,
    endsAt: null,
  },
];

export const samplePlatformSettings = {
  currency: 'THB',
  storefrontUrl: 'http://localhost:3000',
  supportEmail: 'support@sopet.co',
};

export const defaultProductsPagination = {
  page: 1,
  limit: 24,
  total: 1,
  totalPages: 1,
};
