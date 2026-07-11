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

export const samplePetTypes = [
  { __typename: 'PetTypeType' as const, id: 'pet-dog', name: 'สุนัข' },
  { __typename: 'PetTypeType' as const, id: 'pet-cat', name: 'แมว' },
  { __typename: 'PetTypeType' as const, id: 'pet-turtle', name: 'เต่า' },
  { __typename: 'PetTypeType' as const, id: 'pet-fish', name: 'ปลา' },
  { __typename: 'PetTypeType' as const, id: 'pet-rabbit', name: 'กระต่าย' },
  { __typename: 'PetTypeType' as const, id: 'pet-bird', name: 'นก' },
];

export const sampleBrands = [
  { __typename: 'BrandType' as const, id: 'brand-1', name: 'แบรนด์ 1' },
  { __typename: 'BrandType' as const, id: 'brand-2', name: 'แบรนด์ 2' },
  { __typename: 'BrandType' as const, id: 'brand-3', name: 'แบรนด์ 3' },
  { __typename: 'BrandType' as const, id: 'brand-4', name: 'แบรนด์ 4' },
  { __typename: 'BrandType' as const, id: 'brand-5', name: 'แบรนด์ 5' },
  { __typename: 'BrandType' as const, id: 'brand-6', name: 'แบรนด์ 6' },
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
  reply: null,
};

export const sampleProductReviewWithReply = {
  ...sampleProductReview,
  id: 'review-2',
  reply: {
    id: 'reply-1',
    body: 'Thank you for your review',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
};

export const sampleStoreReview = {
  id: 'store-review-1',
  productId: CATALOG_PRODUCT_ID,
  productName: 'Premium Dog Food 5kg',
  productSlug: 'premium-dog-food-5kg',
  productImageUrl: 'https://example.com/dog-food.jpg',
  rating: 5,
  comment: 'Great product',
  createdAt: '2026-01-01T00:00:00.000Z',
  customerName: 'Test Customer',
  reply: null,
  images: [],
};

export const sampleProductReviewWithImages = {
  ...sampleProductReview,
  id: 'review-with-images',
  images: [
    { id: 'review-img-1', url: 'https://example.com/review-1.jpg' },
    { id: 'review-img-2', url: 'https://example.com/review-2.jpg' },
  ],
};

export const sampleStoreReviewWithImages = {
  ...sampleStoreReview,
  id: 'store-review-with-images',
  images: [{ id: 'review-img-1', url: 'https://example.com/review-1.jpg' }],
};

export const sampleStoreReviewWithReply = {
  ...sampleStoreReview,
  id: 'store-review-2',
  reply: {
    id: 'reply-1',
    body: 'Thank you for shopping with us',
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
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
    linkUrl: '/products',
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
    linkUrl: '/products',
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
