'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import { ReviewImagePicker } from '@/components/molecules/ReviewImagePicker/ReviewImagePicker';

export type ReviewModalItem = {
  id: string;
  title: string;
  thumbnail?: string | null;
  variantTitle?: string | null;
  unitPrice: number;
  productId: string;
};

export type ReviewSubmitData = {
  productId: string;
  rating: number;
  comment: string;
  imageFiles: File[];
};

type ReviewFormEntry = {
  itemId: string;
  productId: string;
  rating: number;
  comment: string;
  imageFiles: File[];
};

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  items: ReviewModalItem[];
  onSubmit: (data: ReviewSubmitData[]) => Promise<void>;
};

type ReviewModalContentProps = {
  items: ReviewModalItem[];
  onClose: () => void;
  onSubmit: (data: ReviewSubmitData[]) => Promise<void>;
};

function ReviewModalContent({ items, onClose, onSubmit }: ReviewModalContentProps) {
  const initialReviewData = useMemo<ReviewFormEntry[]>(
    () =>
      items.map((item) => ({
        itemId: item.id,
        productId: item.productId,
        rating: 0,
        comment: '',
        imageFiles: [],
      })),
    [items],
  );

  const [reviewData, setReviewData] = useState<ReviewFormEntry[]>(initialReviewData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const updateItemReview = (
    itemId: string,
    field: 'rating' | 'comment' | 'imageFiles',
    value: number | string | File[],
  ) => {
    setReviewData((previous) =>
      previous.map((entry) => (entry.itemId === itemId ? { ...entry, [field]: value } : entry)),
    );
    if (error && field === 'rating') {
      setError(null);
    }
  };

  const allItemsRated = reviewData.every((entry) => entry.rating > 0);

  const handleSubmit = async () => {
    if (!allItemsRated) {
      setError('กรุณาให้คะแนนสำหรับสินค้าทั้งหมด');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(
        reviewData.map((entry) => ({
          productId: entry.productId,
          rating: entry.rating,
          comment: entry.comment,
          imageFiles: entry.imageFiles,
        })),
      );
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ล้มเหลวในการส่งรีวิว');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      header={
        <h2 id="review-modal-title" className="sop-headline-sm-medium text-sop-neutral-gray-200">
          รีวิวสินค้า
        </h2>
      }
      footer={
        <div className="flex gap-4 justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !allItemsRated}
            loading={isSubmitting}
          >
            ยืนยัน
          </Button>
        </div>
      }
    >
      <div ref={modalRef} tabIndex={-1}>
        {error && (
          <p role="alert" className="mb-4 sop-body-sm-regular text-sop-system-error-400">
            {error}
          </p>
        )}
        <div className="space-y-6">
          {items.map((item) => {
            const entry = reviewData.find((data) => data.itemId === item.id);
            if (!entry) return null;

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 border-b border-sop-neutral-grayalpha-300 pb-4"
              >
                <p className="sop-body-md-medium text-sop-neutral-gray-300">{item.title}</p>
                <div className="flex items-center gap-2">
                  <span className="sop-body-sm-medium text-sop-primary-500">ให้คะแนน</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        aria-label={`ให้ ${index + 1} ดาว`}
                        onClick={() => updateItemReview(item.id, 'rating', index + 1)}
                        className="text-lg"
                      >
                        {index < entry.rating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={entry.comment}
                  onChange={(event) => updateItemReview(item.id, 'comment', event.target.value)}
                  placeholder="แบ่งปันประสบการณ์ของคุณ"
                  className="h-24 w-full rounded-sop-12px border border-sop-neutral-gray-500 p-3 sop-body-sm-regular"
                />
                <ReviewImagePicker
                  files={entry.imageFiles}
                  disabled={isSubmitting}
                  onChange={(files) => updateItemReview(item.id, 'imageFiles', files)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export default function ReviewModal({ isOpen, onClose, items, onSubmit }: ReviewModalProps) {
  if (!isOpen) return null;

  const itemsKey = items.map((item) => item.id).join(',');

  return <ReviewModalContent key={itemsKey} items={items} onClose={onClose} onSubmit={onSubmit} />;
}
