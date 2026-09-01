'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChainIcon } from '@/components/atoms/icons/filled/ChainIcon';
import { InstagramCustomIcon } from '@/components/atoms/icons/filled/InstagramCustomIcon';
import { MeatballsMenuIcon } from '@/components/atoms/icons/filled/MeatballsMenuIcon';
import type { VariantOptions } from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import { trackShare } from '@/lib/analytics';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { buildAbsoluteUrl } from '@/lib/seo/metadata';
import { cn } from '@/lib/utils';

type ShareButtonConfig = {
  label: string;
  method: string;
  icon: () => React.ReactNode;
  handler?: () => void;
  iconClassName?: string;
};

function stripHtml(html: string): string {
  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent ?? '';
  }

  // SSR / non-DOM fallback — strip tags without executing markup.
  return html.replace(/<[^>]*>/g, '');
}

function getShortDescription(product: ProductDetail): string {
  if (!product.description) return '';

  const plainText = /<[^>]+>/.test(product.description)
    ? stripHtml(product.description)
    : product.description;

  return plainText.length > 150 ? `${plainText.substring(0, 150).trim()}...` : plainText.trim();
}

/**
 * Text payload for Web Share / native targets. Deliberately excludes the URL:
 * `navigator.share` receives the link via its own `url` field, so embedding it
 * here too would duplicate the link in LINE/Messenger previews.
 */
export function getProductShareText(product: ProductDetail): string {
  const description = getShortDescription(product);
  return description ? `${product.name || ''}\n${description}` : product.name || '';
}

/**
 * Canonical, always-public share URL: `{NEXT_PUBLIC_BASE_URL}/product/{id}`
 * plus the currently selected variant options as query params (decision 2B).
 * Independent of `window.location`, so shared links never leak localhost, the
 * current host, or tracking params, and always resolve OG previews.
 */
export function buildProductShareUrl(
  productId: string,
  selectedOptions: VariantOptions = {},
): string {
  const base = buildAbsoluteUrl(`/product/${productId}`);
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(selectedOptions)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

const SHARE_ICON_BUTTON_CLASS =
  'flex h-sop-40px w-sop-40px cursor-pointer items-center justify-center rounded-full transition-colors';

function ShareBrandIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="h-sop-40px w-sop-40px shrink-0"
      draggable={false}
    />
  );
}

export function ProductShareModal({
  isOpen,
  onClose,
  product,
  selectedOptions = {},
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ProductDetail;
  selectedOptions?: VariantOptions;
}) {
  const productLink = useMemo(
    () => buildProductShareUrl(product.id, selectedOptions),
    [product.id, selectedOptions],
  );

  const [canNativeShare, setCanNativeShare] = useState(false);

  useLayoutEffect(() => {
    // Client-only feature detection: navigator is unavailable during SSR, so this
    // must stay false on the server render and sync once mounted in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator.share === 'function');
  }, []);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [handleEscape, isOpen]);

  const emitShare = (method: string) => {
    trackShare({ method, item_id: product.id });
  };

  const copyProductLink = async (): Promise<boolean> => {
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

      return true;
    } catch {
      return false;
    }
  };

  const handleCopyLink = async () => {
    const copied = await copyProductLink();

    if (copied) {
      emitShare('copy_link');
      toast.success('คัดลอกลิงก์สำเร็จ', {
        description: 'ลิงก์สินค้าถูกคัดลอกไปยังคลิปบอร์ดแล้ว',
      });
      onClose();
      return;
    }

    toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถคัดลอกลิงก์ได้' });
  };

  const handleInstagramShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name || '',
          text: getProductShareText(product),
          url: productLink,
        });
        emitShare('instagram');
        onClose();
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    const copied = await copyProductLink();
    if (!copied) {
      toast.error('เกิดข้อผิดพลาด', { description: 'ไม่สามารถคัดลอกลิงก์ได้' });
      return;
    }

    emitShare('instagram');
    toast.success('คัดลอกลิงก์สำเร็จ', {
      description: 'เปิด Instagram แล้ววางลิงก์เพื่อแชร์',
    });

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }

    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name || '',
          text: getProductShareText(product),
          url: productLink,
        });
        emitShare('native');
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

  const openShareWindow = (method: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    emitShare(method);
    onClose();
  };

  const shareButtons: ShareButtonConfig[] = [
    {
      label: 'คัดลอกลิงก์',
      method: 'copy_link',
      icon: () => <ChainIcon size={{ mobile: 16, desktop: 16 }} color="#4C4C4C" />,
      handler: () => void handleCopyLink(),
      iconClassName: `${SHARE_ICON_BUTTON_CLASS} bg-[#D6D6D6] hover:bg-[#C0C0C0]`,
    },
    {
      label: 'Line',
      method: 'line',
      icon: () => <ShareBrandIcon src="/images/share/lineIcon.svg" alt="Line" />,
      handler: () =>
        openShareWindow(
          'line',
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(productLink)}`,
        ),
      iconClassName: SHARE_ICON_BUTTON_CLASS,
    },
    {
      label: 'Facebook',
      method: 'facebook',
      icon: () => <ShareBrandIcon src="/images/share/facebookIcon.svg" alt="Facebook" />,
      handler: () =>
        openShareWindow(
          'facebook',
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`,
        ),
      iconClassName: SHARE_ICON_BUTTON_CLASS,
    },
    {
      label: 'Messenger',
      method: 'messenger',
      icon: () => <ShareBrandIcon src="/images/share/messangerIcon.svg" alt="Messenger" />,
      handler: () =>
        openShareWindow(
          'messenger',
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(productLink)}&app_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ''}&redirect_uri=${encodeURIComponent(productLink)}`,
        ),
      iconClassName: SHARE_ICON_BUTTON_CLASS,
    },
    {
      label: 'Instagram',
      method: 'instagram',
      icon: () => <InstagramCustomIcon size={{ mobile: 24, desktop: 24 }} color="#FFFFFF" />,
      handler: () => void handleInstagramShare(),
      iconClassName: `${SHARE_ICON_BUTTON_CLASS} bg-gradient-to-br from-[#FCAF45] via-[#FD1D1D] to-[#833AB4] hover:opacity-90`,
    },
    {
      label: 'แอปอื่นๆ',
      method: 'native',
      icon: () => <MeatballsMenuIcon size={{ mobile: 20, desktop: 20 }} color="#4C4C4C" />,
      handler: () => void handleNativeShare(),
      iconClassName: `${SHARE_ICON_BUTTON_CLASS} border border-[#D6D6D6] bg-transparent hover:bg-[#F5F5F5]`,
    },
  ];

  const visibleShareButtons = canNativeShare
    ? shareButtons
    : shareButtons.filter((button) => button.method !== 'native');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="ปิดหน้าต่างแชร์"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-share-modal-title"
        className="relative z-10 mx-4 w-full max-w-md rounded-sop-16px bg-sop-base-white px-6 py-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center border-b border-[#D6D6D6] py-2">
            <h2
              id="product-share-modal-title"
              className="sop-body-lg-medium text-center text-[#232323]"
            >
              แชร์สินค้าให้เพื่อนของคุณ
            </h2>
          </div>
          <div className="grid w-full grid-cols-5 gap-x-3 gap-y-4 justify-items-center">
            {visibleShareButtons.map((button, index) => (
              <button
                key={button.label}
                type="button"
                onClick={button.handler}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center gap-0.5',
                  canNativeShare && index === visibleShareButtons.length - 1 && 'col-start-3',
                )}
                aria-label={`แชร์ผ่าน ${button.label}`}
              >
                <span className={button.iconClassName} aria-hidden="true">
                  {button.icon()}
                </span>
                <span className="sop-body-sm-light text-center text-sop-base-black">
                  {button.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductShareModal;
