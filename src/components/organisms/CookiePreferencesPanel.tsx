'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Modal } from '@/components/atoms/Modal';
import { BarChartIcon, LockSimpleIcon, ShieldCheckIcon } from '@/components/atoms/icons';
import {
  readConsentPreferences,
  writeConsentPreferences,
  acceptAllCookies,
  type CookieConsentPreferences,
} from '@/lib/consent/cookie-consent';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type CookiePreferencesPanelProps = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_DRAFT: CookieConsentPreferences = {
  analytics: false,
  marketing: false,
};

type CategoryRowProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label': string;
};

function CategoryRow({
  icon,
  title,
  description,
  badge,
  checked,
  disabled = false,
  onChange,
  'aria-label': ariaLabel,
}: CategoryRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-sop-16px rounded-sop-16px border border-sop-neutral-grayalpha-200',
        'bg-sop-base-white p-sop-16px transition-all shadow-2xs',
      )}
    >
      <div className="flex h-sop-48px w-sop-48px shrink-0 items-center justify-center rounded-full bg-sop-primary-100 text-sop-primary-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-sop-8px">
          <p className="sop-body-md-bold text-sop-neutral-gray-100">{title}</p>

          {badge ? (
            <span className="sop-body-xs-medium rounded-full bg-sop-primary-100 px-sop-8px py-0.5 text-sop-primary-600">
              {badge}
            </span>
          ) : null}
        </div>

        <p className="sop-body-xs-regular md:sop-body-sm-regular lg:sop-body-sm-regular mt-sop-4px text-sop-neutral-gray-400">
          {description}
        </p>
      </div>

      <div className="shrink-0">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={(next) => onChange?.(next)}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
}

/**
 * Granular CMP preferences panel.
 * Designed to match SOPet cookie settings modal specification.
 */
export function CookiePreferencesPanel({ open, onClose }: CookiePreferencesPanelProps) {
  const [draft, setDraft] = useState<CookieConsentPreferences>(DEFAULT_DRAFT);

  useEffect(() => {
    if (!open) {
      return;
    }

    const stored = readConsentPreferences();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(stored ?? DEFAULT_DRAFT);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <Modal
      aria-label="ตั้งค่าคุกกี้"
      width={580}
      insideCloseButton
      onClose={onClose}
      className="relative overflow-hidden rounded-sop-24px shadow-2xl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 z-0 hidden h-55 w-[320px] sm:block"
      >
        <svg
          viewBox="0 0 320 220"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d="
              M 320 0
              L 60 0
              C 100 30 200 20 240 55
              C 275 85 290 140 320 200
              Z
            "
            fill="#e9dff8"
          />
        </svg>

        <svg
          viewBox="0 0 320 220"
          className="absolute inset-0 h-full w-full opacity-40"
          preserveAspectRatio="none"
        >
          <path
            d="
              M 320 0
              L 210 0
              C 235 30 255 10 275 55
              C 295 80 305 125 320 160
              Z
            "
            fill="#f9f6fe"
          />
        </svg>
      </div>

      <div className="p-sop-20px sm:p-sop-24px">
        <div className="flex items-start gap-sop-16px pr-10 sm:gap-sop-20px sm:pr-8">
          <Image
            src="/images/cookie/cookie-banner.png"
            alt="ตั้งค่าคุกกี้"
            width={128}
            height={128}
            className="hidden h-sop-128px w-sop-128px shrink-0 object-contain md:block"
            priority
          />

          <div className="flex-1 pt-1">
            <h2 className="sop-headline-md-bold text-sop-neutral-gray-100">ตั้งค่าคุกกี้</h2>

            <p className="sop-body-sm-regular md:sop-body-sm-regular lg:sop-body-sm-regular mt-sop-8px text-sop-neutral-gray-400 leading-relaxed">
              เราใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานเว็บไซต์ของคุณให้ดียิ่งขึ้น
              คุณสามารถเลือกจัดการการตั้งค่าได้ตามความต้องการ ดูรายละเอียดเพิ่มเติมใน{' '}
              <Link
                href="/policy/privacy-policy"
                className="sop-body-sm-medium text-sop-primary-600 underline-offset-2 hover:underline"
              >
                นโยบายความเป็นส่วนตัว
              </Link>
            </p>
          </div>
        </div>
        <div className="mt-sop-20px flex flex-col gap-sop-12px">
          <CategoryRow
            icon={<ShieldCheckIcon size={{ mobile: 24 }} color="#884ECF" />}
            title="คุกกี้ที่จำเป็น"
            badge="จำเป็น"
            description="ใช้สำหรับแสดงและทำงานของเว็บไซต์ และความปลอดภัยของเว็บไซต์ ไม่สามารถปิดได้"
            checked
            disabled
            aria-label="คุกกี้ที่จำเป็น (เปิดเสมอ)"
          />

          <CategoryRow
            icon={<BarChartIcon size={{ mobile: 24 }} color="#884ECF" />}
            title="คุกกี้วิเคราะห์"
            description="ช่วยวิเคราะห์การใช้งานเว็บไซต์ (เช่น Google Analytics) เพื่อปรับปรุงประสบการณ์ โดยไม่ระบุตัวตนโดยตรง"
            checked={draft.analytics}
            onChange={(analytics) =>
              setDraft((prev) => ({
                ...prev,
                analytics,
              }))
            }
            aria-label="คุกกี้วิเคราะห์"
          />
        </div>

        <div className="mt-sop-20px flex flex-col items-center">
          <div className="mb-sop-16px flex items-center justify-center gap-sop-8px text-sop-neutral-gray-400 sop-body-xs-regular">
            <LockSimpleIcon size={{ mobile: 14 }} className="shrink-0" />{' '}
            <span>การตั้งค่าจะถูกบันทึกไว้ในเบราว์เซอร์ของคุณ</span>
          </div>

          <div className="flex w-full flex-col gap-sop-12px sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              size="md"
              rounded="rounded"
              className="rounded-sop-12px! border-sop-secondary-500! text-sop-secondary-500! hover:bg-sop-secondary-100! px-sop-24px! sop-body-sm-medium!"
              onClick={() => {
                writeConsentPreferences({
                  ...draft,
                  marketing: false,
                });
                onClose();
              }}
            >
              บันทึกการตั้งค่า
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              rounded="rounded"
              className="rounded-sop-12px! bg-sop-primary-600! text-sop-base-white! hover:bg-sop-primary-700! px-sop-24px! sop-body-sm-medium!"
              onClick={() => {
                acceptAllCookies();
                onClose();
              }}
            >
              ยอมรับทั้งหมด
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
