'use client';

import { Button } from '@/components/atoms/Button';

type ProductDetailsFooterProps = {
  price: number;
  disabled?: boolean;
};

export default function ProductDetailsFooter({
  price,
  disabled = false,
}: ProductDetailsFooterProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-sop-neutral-grayalpha-200 bg-sop-base-white px-4 py-3 md:hidden"
      data-testid="product-details-footer"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="sop-headline-sm-medium text-sop-secondary-500" data-testid="footer-price">
          ฿{price.toLocaleString('th-TH')}
        </p>
        <Button
          type="button"
          disabled={disabled}
          fill
          size="lg"
          aria-label="เพิ่มลงตะกร้า"
          data-testid="add-to-cart-button"
        >
          เพิ่มลงตะกร้า
        </Button>
      </div>
    </div>
  );
}
