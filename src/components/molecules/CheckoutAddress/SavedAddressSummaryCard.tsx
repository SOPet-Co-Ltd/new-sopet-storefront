'use client';

import { Button } from '@/components/atoms/Button';
import type { SavedAddress } from '@/lib/hooks/useAddresses';
import { formatThaiPhoneNumberForDisplay } from '@/lib/helpers/phone';

type SavedAddressSummaryCardProps = {
  address: SavedAddress;
  onChangeClick: () => void;
  isModalOpen?: boolean;
};

function formatAddressLine(address: SavedAddress): string {
  return [address.addressLine1, address.tumbon, address.amphoe, address.province, address.postalCode]
    .filter(Boolean)
    .join(' ');
}

export function SavedAddressSummaryCard({
  address,
  onChangeClick,
  isModalOpen = false,
}: SavedAddressSummaryCardProps) {
  return (
    <div
      className="flex flex-col gap-sop-16px md:flex-row md:items-start md:justify-between md:gap-sop-22px"
      data-testid="address-summary"
    >
      <div className="min-w-0 flex-1 space-y-sop-4px">
        <div className="flex flex-wrap items-center gap-sop-16px">
          <p
            className="sop-body-sm-medium text-sop-neutral-gray-200"
            data-testid="address-summary-name"
          >
            {address.fullName} ({formatThaiPhoneNumberForDisplay(address.phone)})
          </p>
          {address.isDefault ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-sop-16 bg-sop-secondary-100 py-0.5 pl-2 pr-2.5 sop-body-xs-medium text-sop-secondary-500"
              data-testid="default-address-badge"
            >
              <span className="h-2 w-2 rounded-full bg-sop-secondary-500" aria-hidden />
              ค่าเริ่มต้น
            </span>
          ) : null}
        </div>

        <p
          className="sop-body-sm-regular text-sop-neutral-gray-200"
          data-testid="address-summary-line"
        >
          {formatAddressLine(address)}
        </p>
        <span className="sr-only" data-testid="address-summary-phone">
          {formatThaiPhoneNumberForDisplay(address.phone)}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={onChangeClick}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        className="h-8 shrink-0 px-sop-12px"
        data-testid="address-change-button"
      >
        เปลี่ยน
      </Button>
    </div>
  );
}
