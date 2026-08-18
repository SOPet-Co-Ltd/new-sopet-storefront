'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
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
              'mx-auto flex w-full max-w-5xl flex-col gap-sop-16px bg-sop-base-white',
              // Mobile: flush to bottom edge → round top only. Desktop: floating sheet → round all sides.
              'rounded-tl-sop-20px rounded-tr-sop-20px md:rounded-sop-20px',
              'px-sop-16px py-sop-16px md:flex-row md:items-center md:justify-between md:px-sop-24px md:py-sop-20px',
              'shadow-[0_-6px_24px_rgba(34,34,41,0.12)] md:shadow-[0_8px_28px_rgba(34,34,41,0.12)]',
            )}
          >
            <p className="sop-body-sm-regular text-sop-neutral-gray-200 md:max-w-3xl">
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
            <div className="flex shrink-0 flex-wrap gap-sop-8px">
              <Button type="button" variant="outline" size="md" onClick={() => setPanelOpen(true)}>
                ตั้งค่า
              </Button>
              <Button type="button" variant="primary" size="md" onClick={() => acceptAllCookies()}>
                ยอมรับทั้งหมด
              </Button>
            </div>
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
