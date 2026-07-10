'use client';

import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { AddressDefaultBadge } from '@/components/molecules/AddressCard/AddressDefaultBadge';
import { formatSavedAddressLine } from '@/lib/address/formatSavedAddressLine';
import { formatThaiPhoneNumberForDisplay } from '@/lib/helpers/phone';
import type { SavedAddress } from '@/lib/hooks/useAddresses';

export type AddressCardProps = {
  address: SavedAddress;
  isActionLoading?: boolean;
  onSetDefault?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function AddressCard({
  address,
  isActionLoading = false,
  onSetDefault,
  onDelete,
}: AddressCardProps) {
  const formattedPhone = formatThaiPhoneNumberForDisplay(address.phone);
  const contactText = formattedPhone
    ? `${address.fullName} (${formattedPhone})`
    : address.fullName;
  const label = address.label || 'ที่อยู่';
  const addressLine = formatSavedAddressLine(address);

  return (
    <article
      className="flex flex-col gap-sop-4px"
      aria-label={`${label}, ${address.fullName}`}
      data-testid="address-card"
      data-address-id={address.id}
    >
      <div className="flex flex-wrap items-start justify-between gap-sop-8px">
        <div className="min-w-0 flex flex-wrap items-center gap-sop-8px">
          <p
            className="sop-body-sm-medium text-sop-neutral-gray-200"
            data-testid="address-card-label"
          >
            {label}
          </p>
          {address.isDefault ? <AddressDefaultBadge /> : null}
        </div>
        <Link
          href={`/user/addresses/${address.id}/edit`}
          className="shrink-0 sop-body-sm-medium text-sop-secondary-500 underline"
          data-testid="address-card-edit-link"
        >
          แก้ไข
        </Link>
      </div>

      <p className="mt-sop-4px wrap-break-word sop-body-sm-regular text-sop-neutral-gray-300">
        {contactText}
      </p>
      {formattedPhone ? (
        <span className="sr-only">{formattedPhone}</span>
      ) : null}

      <p className="mt-sop-4px wrap-break-word sop-body-sm-regular text-sop-neutral-gray-400">
        {addressLine}
      </p>

      <div
        className="mt-sop-12px flex flex-wrap gap-sop-8px"
        aria-busy={isActionLoading || undefined}
      >
        {!address.isDefault ? (
          <Button
            variant="outline"
            size="sm"
            loading={isActionLoading}
            disabled={isActionLoading}
            onClick={() => onSetDefault?.(address.id)}
            data-testid="address-card-set-default-button"
          >
            ตั้งเป็นที่อยู่หลัก
          </Button>
        ) : null}
        <Button
          variant="destructive"
          size="sm"
          loading={isActionLoading}
          disabled={isActionLoading}
          onClick={() => onDelete?.(address.id)}
          data-testid="address-card-delete-button"
        >
          ลบ
        </Button>
      </div>
    </article>
  );
}
