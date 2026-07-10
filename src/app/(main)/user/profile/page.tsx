'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import {
  ArrowRightIcon,
  FooterMailIcon,
  FooterPhoneIcon,
} from '@/components/atoms/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';
import { cn } from '@/lib/utils';

function getProfileInitials(fullName?: string | null): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return 'SP';

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

type ProfileContactRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
  empty: boolean;
  href: string;
  actionLabel: string;
};

function ProfileContactRow({
  icon,
  label,
  value,
  empty,
  href,
  actionLabel,
}: ProfileContactRowProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-sop-neutral-gray-500"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sop-primary-50 text-sop-primary-500 [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block sop-body-xs-regular text-sop-neutral-gray-400">{label}</span>
        <span
          className={cn(
            'mt-0.5 block truncate sop-body-sm-medium',
            empty ? 'text-sop-neutral-gray-400' : 'text-sop-neutral-gray-200',
          )}
        >
          {value}
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-1 sop-body-sm-medium text-sop-secondary-500 group-hover:text-sop-secondary-600">
        {actionLabel}
        <ArrowRightIcon size={{ mobile: 16, desktop: 16 }} />
      </span>
    </Link>
  );
}

type ProfileDetailsFormProps = {
  customerId: string;
  initialFullName: string;
};

function ProfileDetailsForm({ customerId, initialFullName }: ProfileDetailsFormProps) {
  const { updateProfile, updating, error } = useProfile();
  const [fullName, setFullName] = useState(initialFullName);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasNameChanged = fullName.trim() !== initialFullName.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccess(false);

    try {
      await updateProfile({
        fullName: fullName.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      );
    }
  };

  return (
    <form key={customerId} onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <Input
        title="ชื่อ-นามสกุล"
        placeholder="กรอกชื่อ-นามสกุลของคุณ"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      {success ? (
        <p className="sop-body-sm-regular text-sop-system-success-500">บันทึกข้อมูลสำเร็จ</p>
      ) : null}
      {(submitError ?? error?.message) ? (
        <p role="alert" className="sop-body-sm-regular text-sop-system-error-400">
          {submitError ?? error?.message}
        </p>
      ) : null}

      <div className="flex justify-end pt-1">
        <Button type="submit" loading={updating} disabled={updating || !hasNameChanged}>
          บันทึกข้อมูล
        </Button>
      </div>
    </form>
  );
}

export default function UserProfilePage() {
  const { customer } = useAuth();

  const displayName = customer?.fullName?.trim() || 'สมาชิก SOPet';
  const profileInitials = getProfileInitials(customer?.fullName);
  const hasPhone = Boolean(customer?.phone);
  const hasEmail = Boolean(customer?.email);

  return (
    <AccountLayout title="ข้อมูลส่วนตัว">
      <div className="mx-auto max-w-2xl space-y-8">
        <section
          aria-labelledby="profile-summary-heading"
          className="overflow-hidden rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white"
        >
          <div className="bg-sop-primary-50 px-6 py-5">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sop-primary-200 sop-headline-sm-medium text-sop-primary-600"
              >
                {profileInitials}
              </span>

              <div className="min-w-0 flex-1">
                <h2
                  id="profile-summary-heading"
                  className="truncate sop-body-lg-medium text-sop-neutral-gray-200"
                >
                  {displayName}
                </h2>
                <p className="mt-0.5 sop-body-sm-regular text-sop-neutral-gray-400">
                  จัดการข้อมูลบัญชีและช่องทางติดต่อของคุณ
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="profile-contact-heading">
          <h2
            id="profile-contact-heading"
            className="mb-3 sop-body-sm-medium text-sop-neutral-gray-200"
          >
            ช่องทางติดต่อ
          </h2>

          <div className="overflow-hidden rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white divide-y divide-sop-neutral-grayalpha-200">
            <ProfileContactRow
              icon={<FooterPhoneIcon />}
              label="เบอร์โทรศัพท์"
              value={hasPhone && customer?.phone ? formatThaiPhoneNumber(customer.phone) : 'ยังไม่ได้เพิ่ม'}
              empty={!hasPhone}
              href={hasPhone ? '/user/profile/phone/change' : '/user/profile/phone/add'}
              actionLabel={hasPhone ? 'เปลี่ยน' : 'เพิ่ม'}
            />
            <ProfileContactRow
              icon={<FooterMailIcon />}
              label="อีเมล"
              value={customer?.email ?? 'ยังไม่ได้เพิ่ม'}
              empty={!hasEmail}
              href={hasEmail ? '/user/profile/email/change' : '/user/profile/email/add'}
              actionLabel={hasEmail ? 'เปลี่ยน' : 'เพิ่ม'}
            />
          </div>
        </section>

        <section aria-labelledby="profile-details-heading">
          <h2
            id="profile-details-heading"
            className="mb-3 sop-body-sm-medium text-sop-neutral-gray-200"
          >
            ข้อมูลทั่วไป
          </h2>

          <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-6">
            <ProfileDetailsForm
              key={customer?.id ?? 'guest'}
              customerId={customer?.id ?? 'guest'}
              initialFullName={customer?.fullName ?? ''}
            />
          </div>
        </section>
      </div>
    </AccountLayout>
  );
}
