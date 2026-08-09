'use client';

import { openCookiePreferences } from '@/lib/consent/cookie-consent';
import { cn } from '@/lib/utils';

type CookieSettingsFooterLinkProps = {
  className?: string;
};

/** Footer control that reopens the cookie preferences panel. */
export function CookieSettingsFooterLink({ className }: CookieSettingsFooterLinkProps) {
  return (
    <button
      type="button"
      onClick={() => openCookiePreferences()}
      className={cn(
        'sop-body-xs-regular text-sop-base-white transition-opacity hover:opacity-80',
        className,
      )}
    >
      ตั้งค่าคุกกี้
    </button>
  );
}
