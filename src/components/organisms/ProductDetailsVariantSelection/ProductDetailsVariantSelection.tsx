'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/atoms/Button';
import { ChainIcon } from '@/components/atoms/icons/filled/ChainIcon';
import { FacebookCustomIcon } from '@/components/atoms/icons/filled/FacebookCustomIcon';
import { InstagramCustomIcon } from '@/components/atoms/icons/filled/InstagramCustomIcon';
import { LineCustomIcon } from '@/components/atoms/icons/filled/LineCustomIcon';
import { MeatballsMenuIcon } from '@/components/atoms/icons/filled/MeatballsMenuIcon';
import { MessengerCustomIcon } from '@/components/atoms/icons/filled/MessengerCustomIcon';
import { ProductDetailQuantitySelection } from '@/components/molecules/ProductDetailQuantitySelection/ProductDetailQuantitySelection';
import { ProductShareWishlistActions } from '@/components/molecules/ProductShareWishlistActions/ProductShareWishlistActions';
import { ProductVariants } from '@/components/molecules/ProductVariants/ProductVariants';
import { markCheckoutEntryAllowed } from '@/lib/checkout/pendingCheckout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useFavorites } from '@/lib/hooks/useFavorites';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { useCart } from '@/lib/providers/CartProvider';
import {
  findVariantByOptions,
  type VariantOptions,
} from './variantUtils';

type ShareButtonConfig = {
  label: string;
  icon: () => React.ReactNode;
  handler?: () => void;
  buttonClassName?: string;
};

function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }

  const element = document.createElement('div');
  element.innerHTML = html;
  return element.textContent ?? element.innerText ?? '';
}

function getShortDescription(product: ProductDetail): string {
  if (!product.description) return '';

  const plainText = /<[^>]+>/.test(product.description)
    ? stripHtml(product.description)
    : product.description;

  return plainText.length > 150 ? `${plainText.substring(0, 150).trim()}...` : plainText.trim();
}

function getProductShareContent(product: ProductDetail, productLink: string): string {
  return `${product.name || ''}\n${getShortDescription(product)}\n${productLink}`;
}

function ProductShareModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail;
}) {
  const productLink = typeof window !== 'undefined' ? window.location.href : `/product/${product.id}`;

  const handleCopyLink = async () => {
    const text = String(productLink ?? '');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.setAttribute('readonly', '');
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      toast.success('คัดลอกลิงก์สำเร็จ', {
        description: 'ลิงก์สินค้าถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
      });
      onClose();
    } catch {
      toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถคัดลอกลิงก์ได้' });
    }
  };

  const handleNativeShare = async () => {
    const shareText = getProductShareContent(product, productLink);

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name || '',
          text: shareText,
          url: productLink,
        });
        onClose();
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถแชร์ได้' });
        }
      }
      return;
    }

    await handleCopyLink();
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    onClose();
  };

  const shareButtons: ShareButtonConfig[] = [
    {
      label: 'คัดลอกลิงก์',
      icon: () => <ChainIcon size={{ mobile: 16, desktop: 16 }} color="#4C4C4C" />,
      handler: () => void handleCopyLink(),
      buttonClassName:
        'md:w-sop-40px md:h-sop-40px w-sop-40px h-sop-40px rounded-full bg-[#D6D6D6] flex items-center justify-center hover:bg-[#C0C0C0] transition-colors cursor-pointer',
    },
    {
      label: 'Line',
      icon: () => <LineCustomIcon size={{ mobile: 40, desktop: 40 }} />,
      handler: () =>
        openShareWindow(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(productLink)}`,
        ),
      buttonClassName:
        'md:w-sop-40px md:h-sop-40px w-sop-40px h-sop-40px rounded-full bg-[#06C755] flex items-center justify-center hover:bg-[#05B04A] transition-colors cursor-pointer',
    },
    {
      label: 'Facebook',
      icon: () => <FacebookCustomIcon size={{ mobile: 40, desktop: 40 }} />,
      handler: () =>
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`,
        ),
      buttonClassName: 'cursor-pointer',
    },
    {
      label: 'Messenger',
      icon: () => <MessengerCustomIcon size={{ mobile: 40, desktop: 40 }} />,
      handler: () =>
        openShareWindow(
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(productLink)}&app_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ''}&redirect_uri=${encodeURIComponent(productLink)}`,
        ),
      buttonClassName:
        'md:w-sop-40px md:h-sop-40px w-sop-40px h-sop-40px rounded-full bg-[#0084FF] flex items-center justify-center hover:bg-[#0073E6] transition-colors cursor-pointer',
    },
    {
      label: 'Instagram',
      icon: () => <InstagramCustomIcon size={{ mobile: 24, desktop: 24 }} color="#FFFFFF" />,
      handler: () => void handleCopyLink(),
      buttonClassName:
        'md:w-sop-40px md:h-sop-40px w-sop-40px h-sop-40px rounded-full bg-gradient-to-br from-[#FCAF45] via-[#FD1D1D] to-[#833AB4] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer',
    },
    {
      label: 'แอปอื่นๆ',
      icon: () => <MeatballsMenuIcon size={{ mobile: 20, desktop: 20 }} color="#4C4C4C" />,
      handler: () => void handleNativeShare(),
      buttonClassName:
        'md:w-sop-40px md:h-sop-40px w-sop-40px h-sop-40px rounded-full border border-[#D6D6D6] bg-transparent flex items-center justify-center hover:bg-sop-neutral-grey-100 transition-colors cursor-pointer',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="ปิดหน้าต่างแชร์"
      />
      <div className="relative bg-sop-base-white rounded-sop-16px p-6 max-w-md w-full mx-4 z-10">
        <div className="flex items-center justify-center mb-6 border-b border-[#D6D6D6] p-2">
          <h2 className="sop-body-lg-medium text-[#232323]">แชร์สินค้าให้เพื่อนของคุณ</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-[12px] justify-items-center">
          {shareButtons.map((button) => (
            <div key={button.label} className="flex flex-col items-center gap-2">
              <button type="button" onClick={button.handler} className={button.buttonClassName}>
                {button.icon()}
              </button>
              <span className="sop-body-sm-light text-sop-base-black text-center">{button.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type ProductDetailsVariantSelectionProps = {
  product: ProductDetail;
  selectedOptions: VariantOptions;
  onSelectedOptionsChange: (options: VariantOptions) => void;
  onVariantChange?: (
    variantId: string | null,
    price: number,
    stockQuantity: number,
    quantity: number,
  ) => void;
  shareModalOpen?: boolean;
  onShareModalOpenChange?: (open: boolean) => void;
};

export default function ProductDetailsVariantSelection({
  product,
  selectedOptions,
  onSelectedOptionsChange,
  onVariantChange,
  shareModalOpen,
  onShareModalOpenChange,
}: ProductDetailsVariantSelectionProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, loading: favoritesLoading } = useFavorites();
  const [wishlistPending, setWishlistPending] = useState(false);
  const [productQuantity, setProductQuantity] = useState(1);
  const [internalShareOpen, setInternalShareOpen] = useState(false);
  const isShareModalOpen = shareModalOpen ?? internalShareOpen;
  const setShareModalOpen = onShareModalOpenChange ?? setInternalShareOpen;
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const selectedVariant = useMemo(
    () => findVariantByOptions(product.variants, selectedOptions),
    [product.variants, selectedOptions],
  );

  const variantId = selectedVariant?.id ?? null;
  const variantStock = selectedVariant?.stockQuantity ?? 0;
  const variantPrice = selectedVariant?.price ?? product.basePrice;
  const hasAnyPrice = variantPrice > 0;
  const isOutOfStock = variantStock <= 0;

  const safeQuantity = Math.min(Math.max(productQuantity, 1), Math.max(variantStock, 1));

  const findVariantStock = (candidateOptions: VariantOptions) =>
    findVariantByOptions(product.variants, candidateOptions)?.stockQuantity ?? 0;

  useEffect(() => {
    onVariantChange?.(variantId, variantPrice, variantStock, safeQuantity);
  }, [onVariantChange, safeQuantity, variantId, variantPrice, variantStock]);

  const syncOptionsToUrl = (nextOptions: VariantOptions) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    Object.keys(nextOptions).forEach((key) => {
      params.delete(key);
      const value = nextOptions[key];
      if (value) {
        params.set(key, value);
      }
    });

    const newSearch = params.toString();
    const newUrl = newSearch ? `${url.pathname}?${newSearch}` : url.pathname;
    window.history.replaceState(null, '', newUrl);
  };

  const handleOptionChange = (optionKey: string, value: string) => {
    setProductQuantity(1);
    onSelectedOptionsChange({ ...selectedOptions, [optionKey]: value });
    syncOptionsToUrl({ ...selectedOptions, [optionKey]: value });
  };

  const handleAddToCart = async () => {
    if (!variantId || isOutOfStock || !hasAnyPrice) return;

    try {
      setIsAddingToCart(true);
      await addItem(variantId, safeQuantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!variantId || isOutOfStock || !hasAnyPrice || safeQuantity < 1) return;

    try {
      setIsBuyingNow(true);
      await addItem(variantId, safeQuantity);
      markCheckoutEntryAllowed();
      router.push('/checkout');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const isWishlisted = isFavorite(product.id);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push('/login?notice=sessionRequired');
      return;
    }

    try {
      setWishlistPending(true);
      if (isWishlisted) {
        await removeFavorite(product.id);
        toast.success('นำออกจากรายการโปรดแล้ว');
      } else {
        await addFavorite(product.id);
        toast.success('เพิ่มในรายการโปรดแล้ว');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถอัปเดตรายการโปรดได้' });
    } finally {
      setWishlistPending(false);
    }
  };

  const handleShareOpen = () => {
    setShareModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-8" data-testid="product-variant-selection">
      {hasAnyPrice && (
        <ProductVariants
          product={product}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
          findVariantStock={findVariantStock}
        />
      )}

      <ProductDetailQuantitySelection
        variantStock={variantStock}
        productQuantity={safeQuantity}
        setProductQuantity={setProductQuantity}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-nowrap items-center gap-2 lg:gap-[18px]">
          <Button
            type="button"
            onClick={() => void handleAddToCart()}
            disabled={isOutOfStock || !hasAnyPrice}
            loading={isAddingToCart}
            size="xl"
            variant="secondary"
            className="h-12 min-w-0 flex-1 border-sop-secondary-500 bg-sop-secondary-100 text-sop-secondary-500"
            aria-busy={isAddingToCart}
            aria-label={
              isAddingToCart
                ? 'กำลังเพิ่มสินค้าลงตะกร้า กรุณารอสักครู่'
                : isOutOfStock
                  ? 'สินค้าหมด'
                  : `เพิ่ม ${product.name} ลงตะกร้า`
            }
          >
            {!hasAnyPrice ? 'NOT AVAILABLE IN YOUR REGION' : isOutOfStock ? 'สินค้าหมด' : 'เพิ่มใส่ตะกร้า'}
          </Button>

          <Button
            type="button"
            onClick={() => void handleBuyNow()}
            disabled={isOutOfStock || !hasAnyPrice}
            loading={isBuyingNow}
            size="xl"
            variant="primary"
            className="h-12 min-w-0 flex-1"
            aria-busy={isBuyingNow}
            aria-label={
              isBuyingNow
                ? 'กำลังดำเนินการซื้อสินค้า กรุณารอสักครู่'
                : isOutOfStock
                  ? 'สินค้าหมด'
                  : `ซื้อ ${product.name} เลย`
            }
          >
            ซื้อสินค้า
          </Button>

          <ProductShareWishlistActions
            productName={product.name}
            onShare={handleShareOpen}
            onWishlist={() => void handleWishlist()}
            disabled={isOutOfStock || !hasAnyPrice}
            isWishlisted={isWishlisted}
            wishlistLoading={wishlistPending || favoritesLoading}
            className="shrink-0"
          />
        </div>

        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {isAddingToCart && 'กำลังเพิ่มสินค้าลงตะกร้า'}
          {isBuyingNow && 'กำลังดำเนินการซื้อสินค้า'}
        </div>
      </div>

      <ProductShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        product={product}
      />
    </div>
  );
}
