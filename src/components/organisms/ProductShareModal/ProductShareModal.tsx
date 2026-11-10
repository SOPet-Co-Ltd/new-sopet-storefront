'use client';

import { useMemo } from 'react';
import { toast } from 'sonner';
import { Modal } from '@/components/atoms/Modal';
import { InstagramCustomIcon } from '@/components/atoms/icons/filled/InstagramCustomIcon';
import type { VariantOptions } from '@/components/organisms/ProductDetailsVariantSelection/variantUtils';
import { trackShare } from '@/lib/analytics';
import type { ProductDetail } from '@/lib/hooks/useProduct';
import { buildProductHref } from '@/lib/routing/productRoutes';
import { buildAbsoluteUrl } from '@/lib/seo/metadata';

type ShareButtonConfig = {
  label: string;
  icon: () => React.ReactNode;
  handler?: () => void;
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
 * Canonical, always-public share URL: `{NEXT_PUBLIC_BASE_URL}/product/{slug}-{storeSlug}`
 * plus the currently selected variant options as query params (decision 2B).
 * Independent of `window.location`, so shared links never leak localhost, the
 * current host, or tracking params, and always resolve OG previews.
 */
export function buildProductShareUrl(
  product: Pick<ProductDetail, 'id' | 'slug' | 'store'>,
  selectedOptions: VariantOptions = {},
): string {
  const base = buildAbsoluteUrl(buildProductHref(product, { encode: true }));
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(selectedOptions)) {
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

function ShareBrandIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="h-12 w-12 shrink-0"
      draggable={false}
    />
  );
}

function CopyLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <rect
        x="8.25"
        y="8.25"
        width="11"
        height="11"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15.75 8.25V6.5A2.25 2.25 0 0 0 13.5 4.25h-7A2.25 2.25 0 0 0 4.25 6.5v7A2.25 2.25 0 0 0 6.5 15.75H8.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function toShareLinkLabel(url: string): string {
  return url.replace(/^https?:\/\//, '');
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
    () => buildProductShareUrl(product, selectedOptions),
    [product, selectedOptions],
  );

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

  const openShareWindow = (method: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');
    emitShare(method);
    onClose();
  };

  const shareButtons: ShareButtonConfig[] = [
    {
      label: 'LINE',
      icon: () => <ShareBrandIcon src="/images/share/lineIcon.svg" alt="" />,
      handler: () =>
        openShareWindow(
          'line',
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(productLink)}`,
        ),
    },
    {
      label: 'Facebook',
      icon: () => <ShareBrandIcon src="/images/share/facebookIcon.svg" alt="" />,
      handler: () =>
        openShareWindow(
          'facebook',
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productLink)}`,
        ),
    },
    {
      label: 'Messenger',
      icon: () => <ShareBrandIcon src="/images/share/messangerIcon.svg" alt="" />,
      handler: () =>
        openShareWindow(
          'messenger',
          `https://www.facebook.com/dialog/send?link=${encodeURIComponent(productLink)}&app_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? ''}&redirect_uri=${encodeURIComponent(productLink)}`,
        ),
    },
    {
      label: 'Instagram',
      icon: () => (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FCAF45] via-[#FD1D1D] to-[#833AB4]">
          <InstagramCustomIcon size={{ mobile: 26, desktop: 26 }} color="#FFFFFF" />
        </span>
      ),
      handler: () => void handleInstagramShare(),
    },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      width={448}
      aria-labelledby="product-share-modal-title"
      contentClassName="px-6 py-5"
    >
      <div className="flex flex-col gap-5">
        <h2 id="product-share-modal-title" className="sop-body-sm-medium text-sop-neutral-gray-200">
          แชร์สินค้าให้เพื่อนของคุณ
        </h2>
        <div className="grid grid-cols-4 justify-items-center">
          {shareButtons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={button.handler}
              className="flex cursor-pointer flex-col items-center gap-3"
              aria-label={`แชร์ผ่าน ${button.label}`}
            >
              <span aria-hidden="true">{button.icon()}</span>
              <span className="sop-body-sm-regular text-center text-sop-neutral-gray-200">
                {button.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="sop-body-sm-medium text-sop-neutral-gray-200">คัดลอกลิงก์</p>
          <div className="flex items-center gap-3 rounded-sop-12px bg-sop-neutral-gray-500 px-4 py-3">
            <p className="sop-body-sm-regular min-w-0 flex-1 truncate text-sop-neutral-gray-400">
              {toShareLinkLabel(productLink)}
            </p>
            <button
              type="button"
              aria-label="คัดลอกลิงก์"
              onClick={() => void handleCopyLink()}
              className="shrink-0 cursor-pointer text-sop-neutral-gray-200"
            >
              <CopyLinkIcon />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ProductShareModal;
