import { sampleOrder } from './checkout';

export const sampleFavorite = {
  id: 'fav-1',
  productId: 'prod-1',
  product: {
    id: 'prod-1',
    name: 'อาหารแมว Premium',
    slug: 'cat-food-premium',
    basePrice: 299,
    thumbnailUrl: 'https://example.com/cat-food.jpg',
    images: [],
  },
};

export const sampleDispute = {
  id: 'dispute-1',
  orderId: sampleOrder.id,
  reason: 'สินค้าเสียหาย',
  issueType: 'damaged',
  status: 'open',
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-07-01T10:00:00.000Z',
  messages: [],
  images: [],
};

export const samplePaymentMethod = {
  id: 'pm-1',
  type: 'card',
  lastFour: '4242',
  brand: 'Visa',
  expiryMonth: 12,
  expiryYear: 2028,
  isDefault: true,
};

export const sampleReviewableItem = {
  orderId: 'order-1',
  orderNumber: 'ORD-001',
  orderItemId: 'item-1',
  productId: 'prod-1',
  productName: 'อาหารแมว Premium',
  productSlug: 'cat-food-premium',
  productImageUrl: 'https://example.com/cat-food.jpg',
  deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  reviewDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
};

export const sampleMyReview = {
  id: 'review-1',
  productId: 'prod-1',
  productName: 'อาหารแมว Premium',
  productSlug: 'cat-food-premium',
  productImageUrl: 'https://example.com/cat-food.jpg',
  orderId: 'order-1',
  rating: 5,
  comment: 'ดีมาก',
  status: 'pending',
  createdAt: '2026-07-01T10:00:00.000Z',
};
