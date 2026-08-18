'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Modal } from '@/components/atoms/Modal';
import {
  readConsentPreferences,
  writeConsentPreferences,
  acceptAllCookies,
  type CookieConsentPreferences,
} from '@/lib/consent/cookie-consent';
import { cn } from '@/lib/utils';

type CookiePreferencesPanelProps = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_DRAFT: CookieConsentPreferences = {
  analytics: false,
  marketing: false,
};

type CategoryRowProps = {
  title: string;
  description: string;
  badge?: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  'aria-label': string;
};

function CategoryRow({
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
        'flex gap-sop-12px rounded-sop-16px border border-sop-neutral-grayalpha-200',
        'bg-sop-base-white px-sop-16px py-sop-16px',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-sop-8px">
          <p className="sop-body-md-medium text-sop-neutral-gray-200">{title}</p>
          {badge ? (
            <span className="sop-body-xs-medium rounded-sop-8 bg-sop-primary-100 px-sop-8px py-0.5 text-sop-primary-600">
              {badge}
            </span>
          ) : null}
        </div>
        <p className="sop-body-sm-regular mt-sop-4px text-sop-neutral-gray-400">{description}</p>
      </div>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(next) => onChange?.(next)}
        aria-label={ariaLabel}
        className="mt-1"
      />
    </div>
  );
}

/**
 * Granular CMP preferences. Copy is engineering default — replace after legal review.
 */
export function CookiePreferencesPanel({ open, onClose }: CookiePreferencesPanelProps) {
  const [draft, setDraft] = useState<CookieConsentPreferences>(DEFAULT_DRAFT);

  useEffect(() => {
    if (!open) {
      return;
    }
    const stored = readConsentPreferences();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate draft from localStorage when panel opens
    setDraft(stored ?? DEFAULT_DRAFT);
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <Modal
      aria-label="ตั้งค่าคุกกี้"
      width={560}
      insideCloseButton
      onClose={onClose}
      header={<h2 className="sop-body-lg-medium pr-10 text-sop-neutral-gray-200">ตั้งค่าคุกกี้</h2>}
      footer={
        <div className="flex flex-col gap-sop-8px sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              writeConsentPreferences({ ...draft, marketing: false });
              onClose();
            }}
          >
            บันทึกการตั้งค่า
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              acceptAllCookies();
              onClose();
            }}
          >
            ยอมรับทั้งหมด
          </Button>
        </div>
      }
    >
      <p className="sop-body-sm-regular text-sop-neutral-gray-400">
        เลือกประเภทคุกกี้ที่ยินยอม
        คุกกี้ที่จำเป็นไม่สามารถปิดได้เพราะใช้ในการเข้าสู่ระบบและตะกร้าสินค้า ดูรายละเอียดใน{' '}
        <Link
          href="/policy/privacy-policy"
          className="sop-body-sm-medium text-sop-secondary-500 underline underline-offset-2"
        >
          นโยบายความเป็นส่วนตัว
        </Link>
      </p>

      <div className="mt-sop-16px flex flex-col gap-sop-12px">
        <CategoryRow
          title="คุกกี้ที่จำเป็น"
          badge="จำเป็น"
          description="ใช้สำหรับเซสชันการเข้าสู่ระบบ ตะกร้าสินค้า และความปลอดภัยของเว็บไซต์ ไม่สามารถปิดได้"
          checked
          disabled
          aria-label="คุกกี้ที่จำเป็น (เปิดเสมอ)"
        />
        <CategoryRow
          title="คุกกี้วิเคราะห์"
          description="ช่วยวัดการใช้งานเว็บไซต์ (เช่น Google Analytics) เพื่อปรับปรุงประสบการณ์ โดยไม่ระบุตัวตนโดยตรง"
          checked={draft.analytics}
          onChange={(analytics) => setDraft((prev) => ({ ...prev, analytics }))}
          aria-label="คุกกี้วิเคราะห์"
        />
        {/* Marketing category hidden until marketing scripts ship */}
      </div>
    </Modal>
  );
}
