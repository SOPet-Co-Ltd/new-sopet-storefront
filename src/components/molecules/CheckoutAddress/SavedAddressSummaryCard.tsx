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
      className="flex flex-col gap-sop-12px md:flex-row md:items-start md:justify-between"
      data-testid="address-summary"
    >
      <div className="flex-1 space-y-sop-8px">
        <div className="flex flex-wrap items-center gap-sop-8px">
          <p
            className="sop-body-sm-medium text-sop-neutral-gray-300"
            data-testid="address-summary-name"
          >
            {address.fullName}
          </p>
          {address.isDefault ? (
            <span
              className="sop-body-xs-medium rounded-sop-16 bg-sop-secondary-100 px-2.5 py-1 text-sop-secondary-500"
              data-testid="default-address-badge"
            >
              ค่าเริ่มต้น
            </span>
          ) : null}
        </div>

        <p
          className="sop-body-sm-regular text-sop-neutral-gray-400"
          data-testid="address-summary-phone"
        >
          {formatThaiPhoneNumberForDisplay(address.phone)}
        </p>

        <p
          className="sop-body-sm-regular text-sop-neutral-gray-400 md:sop-body-md-regular"
          data-testid="address-summary-line"
        >
          {formatAddressLine(address)}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={onChangeClick}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        data-testid="address-change-button"
      >
        เปลี่ยน
      </Button>
    </div>
  );
}
