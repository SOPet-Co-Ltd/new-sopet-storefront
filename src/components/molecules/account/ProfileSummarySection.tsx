'use client';

import { AccountCard } from '@/components/molecules/account/AccountCard';
import { ProfileAvatarEditor } from '@/components/molecules/account/ProfileAvatarEditor';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';
import { cn } from '@/lib/utils';

type ProfileSummarySectionProps = {
  displayName: string;
  initials: string;
  profilePhotoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  onPhotoChange: (url: string | null) => Promise<void>;
};

function buildContactLine(phone?: string | null, email?: string | null): string | null {
  const parts: string[] = [];
  if (phone?.trim()) {
    parts.push(formatThaiPhoneNumber(phone));
  }
  if (email?.trim()) {
    parts.push(email.trim());
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function ProfileSummarySection({
  displayName,
  initials,
  profilePhotoUrl,
  phone,
  email,
  onPhotoChange,
}: ProfileSummarySectionProps) {
  const contactLine = buildContactLine(phone, email);

  return (
    <AccountCard padding="md" className="overflow-hidden p-0">
      <div className="relative px-6 pb-8 pt-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sop-primary-50 via-sop-primary-50/60 to-transparent"
        />

        <div className="relative flex flex-col items-center text-center">
          <ProfileAvatarEditor
            value={profilePhotoUrl}
            initials={initials}
            displayName={displayName}
            onChange={onPhotoChange}
          />

          <div className="mt-5 max-w-full space-y-1">
            <h2
              id="profile-summary-heading"
              className="truncate sop-headline-sm-medium text-sop-neutral-gray-200"
            >
              {displayName}
            </h2>

            {contactLine ? (
              <p className="truncate sop-body-sm-regular text-sop-neutral-gray-400">
                {contactLine}
              </p>
            ) : (
              <p className="sop-body-sm-regular text-sop-neutral-gray-400">
                เพิ่มเบอร์โทรหรืออีเมลด้านล่างเพื่อติดต่อได้สะดวกขึ้น
              </p>
            )}
          </div>

          <span
            className={cn(
              'mt-4 inline-flex items-center rounded-full bg-sop-primary-50 px-3 py-1',
              'sop-body-xs-medium text-sop-primary-600',
            )}
          >
            สมาชิก SOPet
          </span>
        </div>
      </div>
    </AccountCard>
  );
}
