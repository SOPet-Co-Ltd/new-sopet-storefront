'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { useCart } from '@/lib/providers/CartProvider';

type ProductMobileStickyBarProps = {
  price: number;
  disabled?: boolean;
  variantId?: string | null;
};

export default function ProductMobileStickyBar({
  price,
  disabled = false,
  variantId = null,
}: ProductMobileStickyBarProps) {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!variantId || disabled) {
      return;
    }

    try {
      setLoading(true);
      await addItem(variantId, 1);
    } finally {
      setLoading(false);
    }
  };

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
          disabled={disabled || !variantId}
          loading={loading}
          fill
          size="lg"
          aria-label="เพิ่มลงตะกร้า"
          data-testid="add-to-cart-button"
          onClick={() => void handleAddToCart()}
        >
          เพิ่มลงตะกร้า
        </Button>
      </div>
    </div>
  );
}
