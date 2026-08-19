'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/atoms/Button';
import { CookiePreferencesPanel } from '@/components/organisms/CookiePreferencesPanel';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_PREFERENCES_OPEN_EVENT,
  acceptAllCookies,
  hasAnalyticsConsent,
  hasConsentDecision,
} from '@/lib/consent/cookie-consent';
import { cn } from '@/lib/utils';

function subscribeConsent(onStoreChange: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener('storage', onStoreChange);

  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener('storage', onStoreChange);
  };
}

/** No-op subscribe: value is constant per environment (false on server, true on client). */
function subscribeIsClient() {
  return () => {};
}

/**
 * CMP shell: first-visit banner and preferences panel (reopen via footer link).
 * Copy is engineering default — replace after legal review.
 * Banner stays hidden until after hydration to avoid FOUC for returning visitors.
 */
export function CookieConsentBanner() {
  const isClient = useSyncExternalStore(
    subscribeIsClient,
    () => true,
    () => false,
  );

  const decided = useSyncExternalStore(subscribeConsent, hasConsentDecision, () => false);

  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const open = () => setPanelOpen(true);

    window.addEventListener(CONSENT_PREFERENCES_OPEN_EVENT, open);

    return () => window.removeEventListener(CONSENT_PREFERENCES_OPEN_EVENT, open);
  }, []);

  if (!isClient) {
    return null;
  }

  const showBanner = !decided && !panelOpen;

  return (
    <>
      {showBanner ? (
        <div
          role="dialog"
          aria-label="ความยินยอมคุกกี้"
          className="fixed inset-x-0 bottom-0 z-50 md:px-sop-32px md:pb-sop-24px"
        >
          <div
            className={cn(
              'relative mx-auto flex w-full max-w-5xl flex-col gap-sop-16px',
              'overflow-hidden bg-sop-base-white',

              // Border radius
              'rounded-tl-sop-20px rounded-tr-sop-20px',
              'md:rounded-sop-20px',

              // Padding
              'px-sop-16px py-sop-16px',
              'md:px-sop-24px md:py-sop-20px',

              // Desktop layout
              'md:flex-row md:items-center md:justify-between',

              // Shadow
              'shadow-[0_-6px_24px_rgba(34,34,41,0.12)]',
              'md:shadow-[0_8px_28px_rgba(34,34,41,0.12)]',
            )}
          >
            {/* ========================================
                Purple Wave Background
                ======================================== */}
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute right-0 top-0 z-0',
                'h-full w-[150px]',
                'overflow-hidden rounded-tr-sop-20px',
                'md:w-[220px]',
              )}
            >
              {/* Main purple wave */}
              <svg
                viewBox="0 0 220 220"
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d="
                    M 220 0
                    L 65 0
                    C 85 30 125 35 145 70
                    C 165 105 180 155 220 220
                    Z
                  "
                  fill="#e9dff8"
                />
              </svg>

              {/* Light highlight wave */}
              <svg
                viewBox="0 0 220 220"
                className="absolute inset-0 h-full w-full opacity-40"
                preserveAspectRatio="none"
              >
                <path
                  d="
                    M 220 0
                    L 135 0
                    C 150 30 175 35 185 70
                    C 198 105 208 150 220 195
                    Z
                  "
                  fill="#f9f6fe"
                />
              </svg>
            </div>

            {/* ========================================
                Desktop Cookie Image
                ======================================== */}
            <Image
              src="/images/cookie/cookie-banner.png"
              alt=""
              width={96}
              height={96}
              aria-hidden="true"
              className={cn(
                'relative z-10 hidden shrink-0 object-contain',
                'md:block md:h-sop-96px md:w-sop-96px',
              )}
              priority
            />

            {/* ========================================
                Content
                ======================================== */}
            <p
              className={cn(
                'relative z-10',
                'sop-body-sm-regular',
                'min-w-0 flex-1',
                'text-sop-neutral-gray-200',
                'md:max-w-3xl',
              )}
            >
              เราใช้คุกกี้ที่จำเป็นต่อการเข้าสู่ระบบและตะกร้าสินค้า
              และขอความยินยอมสำหรับคุกกี้วิเคราะห์
              คุณสามารถยอมรับทั้งหมดหรือเลือกประเภทที่ต้องการได้ ดูรายละเอียดใน{' '}
              <Link
                href="/policy/privacy-policy"
                className="sop-body-sm-medium text-sop-secondary-500 underline underline-offset-2"
              >
                นโยบายความเป็นส่วนตัว
              </Link>{' '}
              และ{' '}
              <Link
                href="/security"
                className="sop-body-sm-medium text-sop-secondary-500 underline underline-offset-2"
              >
                ศูนย์ความปลอดภัย
              </Link>
            </p>

            {/* ========================================
                Actions
                ======================================== */}
            <div className="relative z-20 flex shrink-0 gap-sop-8px">
              <Button type="button" variant="outline" size="md" onClick={() => setPanelOpen(true)}>
                ตั้งค่า
              </Button>

              <Button type="button" variant="primary" size="md" onClick={() => acceptAllCookies()}>
                ยอมรับทั้งหมด
              </Button>
            </div>

            {/* ========================================
                Mobile Cookie Decoration
                ======================================== */}
            <Image
              src="/images/cookie/cookie-banner.png"
              alt=""
              width={48}
              height={48}
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute bottom-[10px] right-[10px] z-5',
                'h-[48px] w-[48px] object-contain ',
                'md:hidden',
              )}
            />
          </div>

          <span className="sr-only">
            {hasAnalyticsConsent() ? 'analytics-allowed' : 'analytics-blocked'}
          </span>
        </div>
      ) : null}

      <CookiePreferencesPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
