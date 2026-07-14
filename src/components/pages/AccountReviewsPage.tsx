'use client';

import { useCallback, useMemo, useState } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { AccountCard } from '@/components/molecules/account/AccountCard';
import { AccountEmptyState } from '@/components/molecules/account/AccountEmptyState';
import { AccountTabBar } from '@/components/molecules/account/AccountTabBar';
import { ReviewableItemCard } from '@/components/molecules/account/ReviewableItemCard';
import { WrittenReviewCard } from '@/components/molecules/account/WrittenReviewCard';
import ReviewModal, {
  type ReviewModalItem,
  type ReviewSubmitData,
} from '@/components/organisms/ReviewModal';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { CreateReviewDocument } from '@/lib/graphql/generated/graphql';
import { uploadReviewImage } from '@/lib/upload/uploadReviewImage';
import {
  type CustomerReviewableItem,
  type ReviewTab,
  useCustomerReviews,
} from '@/lib/hooks/useCustomerReviews';

const REVIEW_TABS = [
  { id: 'pending', label: 'รอดำเนินการ' },
  { id: 'written', label: 'เขียนแล้ว' },
] as const;

const PENDING_EMPTY_MESSAGE = 'ยังไม่มีสินค้าที่รอให้รีวิว';
const WRITTEN_EMPTY_MESSAGE = 'ยังไม่มีรีวิวที่เขียนแล้ว';
const REVIEWS_ERROR_MESSAGE = 'ไม่สามารถโหลดข้อมูลรีวิวได้';
const REVIEW_WINDOW_EXPIRED_MESSAGE = 'หมดเวลาในการเขียนรีวิวแล้ว';

export function parseReviewsTab(rawTab: string | null): ReviewTab {
  if (rawTab === 'written') {
    return 'written';
  }
  return 'pending';
}

export function toReviewModalItem(item: CustomerReviewableItem): ReviewModalItem {
  return {
    id: item.orderItemId,
    title: item.productName,
    thumbnail: item.productImageUrl,
    variantTitle: null,
    unitPrice: 0,
    productId: item.productId,
  };
}

function getReviewMutationErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    const graphQLError = error.errors[0];

    if (graphQLError?.extensions?.code === 'REVIEW_WINDOW_EXPIRED') {
      return REVIEW_WINDOW_EXPIRED_MESSAGE;
    }

    if (graphQLError?.message) {
      return graphQLError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'ล้มเหลวในการส่งรีวิว';
}

function ReviewsLoadingSkeleton() {
  return (
    <div className="space-y-3" data-testid="reviews-loading-skeleton">
      {Array.from({ length: 3 }, (_, index) => (
        <AccountCard key={index} variant="loading" />
      ))}
    </div>
  );
}

type ReviewsErrorPanelProps = {
  onRetry: () => void | Promise<unknown>;
};

function ReviewsErrorPanel({ onRetry }: ReviewsErrorPanelProps) {
  return (
    <AccountCard padding="lg" variant="error">
      <div className="space-y-4 text-center" data-testid="reviews-error-panel">
        <p className="sop-body-sm-regular text-sop-system-error-500">{REVIEWS_ERROR_MESSAGE}</p>
        <Button onClick={() => void onRetry()} size="sm" type="button" variant="outline">
          ลองอีกครั้ง
        </Button>
      </div>
    </AccountCard>
  );
}

export function AccountReviewsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseReviewsTab(searchParams.get('tab'));
  const orderIdParam = searchParams.get('orderId');
  const { reviewableItems, myReviews, loading, error, refetch } = useCustomerReviews({
    tab: activeTab,
  });
  const [selectedReviewItems, setSelectedReviewItems] = useState<CustomerReviewableItem[]>([]);
  const [handledOrderId, setHandledOrderId] = useState<string | null>(null);
  const [createReviewMutation] = useMutation(CreateReviewDocument);

  const modalItems = useMemo(
    () => selectedReviewItems.map(toReviewModalItem),
    [selectedReviewItems],
  );

  // Handle the "review this order" deep link once its reviewable items become
  // available, adjusting state during render instead of syncing via an effect.
  if (orderIdParam && !loading && activeTab === 'pending' && handledOrderId !== orderIdParam) {
    const orderItems = reviewableItems.filter((item) => item.orderId === orderIdParam);
    if (orderItems.length > 0) {
      setHandledOrderId(orderIdParam);
      setSelectedReviewItems(orderItems);
    }
  }

  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (tabId === 'pending') {
        params.delete('tab');
      } else {
        params.set('tab', tabId);
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const clearOrderIdParam = useCallback(() => {
    if (!searchParams.get('orderId')) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('orderId');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const handleCloseReviewModal = useCallback(() => {
    setSelectedReviewItems([]);
    clearOrderIdParam();
  }, [clearOrderIdParam]);

  const handleReviewSubmit = useCallback(
    async (data: ReviewSubmitData[]) => {
      if (selectedReviewItems.length === 0) {
        return;
      }

      for (const entry of data) {
        const sourceItem = selectedReviewItems.find((item) => item.productId === entry.productId);
        if (!sourceItem) {
          continue;
        }

        try {
          const imageUrls: string[] = [];
          for (const file of entry.imageFiles) {
            imageUrls.push(await uploadReviewImage(file));
          }

          await createReviewMutation({
            variables: {
              input: {
                productId: entry.productId,
                orderId: sourceItem.orderId,
                rating: entry.rating,
                comment: entry.comment || undefined,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
              },
            },
          });
        } catch (submitError) {
          throw new Error(getReviewMutationErrorMessage(submitError));
        }
      }

      toast.success('ส่งรีวิวสำเร็จ');
      await refetch();
    },
    [createReviewMutation, refetch, selectedReviewItems],
  );

  const renderTabPanel = () => {
    if (loading) {
      return <ReviewsLoadingSkeleton />;
    }

    if (error) {
      return <ReviewsErrorPanel onRetry={refetch} />;
    }

    if (activeTab === 'pending') {
      if (reviewableItems.length === 0) {
        return (
          <AccountCard padding="lg">
            <AccountEmptyState
              cta={{ href: '/user/orders', label: 'ดูคำสั่งซื้อ' }}
              message={PENDING_EMPTY_MESSAGE}
            />
          </AccountCard>
        );
      }

      return (
        <div className="space-y-3" data-testid="pending-reviews-list">
          {reviewableItems.map((item) => (
            <ReviewableItemCard
              key={`${item.orderId}-${item.orderItemId}`}
              item={item}
              onWriteReview={(item) => setSelectedReviewItems([item])}
            />
          ))}
        </div>
      );
    }

    if (myReviews.length === 0) {
      return (
        <AccountCard padding="lg">
          <AccountEmptyState message={WRITTEN_EMPTY_MESSAGE} />
        </AccountCard>
      );
    }

    return (
      <div className="space-y-3" data-testid="written-reviews-list">
        {myReviews.map((review) => (
          <WrittenReviewCard key={review.id} review={review} />
        ))}
      </div>
    );
  };

  return (
    <AccountLayout title="รีวิวสินค้า">
      <AccountTabBar
        ariaLabel="แท็บรีวิว"
        onValueChange={handleTabChange}
        tabs={[...REVIEW_TABS]}
        value={activeTab}
      >
        {renderTabPanel()}
      </AccountTabBar>

      <ReviewModal
        isOpen={selectedReviewItems.length > 0}
        items={modalItems}
        onClose={handleCloseReviewModal}
        onSubmit={handleReviewSubmit}
      />
    </AccountLayout>
  );
}
