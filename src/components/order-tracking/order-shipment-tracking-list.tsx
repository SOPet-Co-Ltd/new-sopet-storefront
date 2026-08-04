import { AccountCard } from '@/components/molecules/account/AccountCard';
import { labelFulfillmentStatus } from '@/lib/constants/fulfillmentStatus';
import {
  HOLD_FULFILLMENT_STATUS,
  STORE_SUSPENSION_HOLD_COPY,
} from '@/lib/constants/storeSuspensionHoldCopy';
import {
  groupItemsByStoreShipment,
  type ShipmentTrackingItem,
} from '@/lib/order-tracking/group-items-by-store-shipment';

type OrderShipmentTrackingListProps = {
  items: ShipmentTrackingItem[];
};

export function OrderShipmentTrackingList({ items }: OrderShipmentTrackingListProps) {
  const shipments = groupItemsByStoreShipment(items);

  if (shipments.size === 0) {
    return null;
  }

  return (
    <AccountCard>
      <p className="mb-2 sop-body-sm-medium text-sop-neutral-gray-200">ติดตามพัสดุ</p>
      <ul className="space-y-3">
        {[...shipments.entries()].map(([storeId, shipment]) => {
          const isHeld = shipment.fulfillmentStatus === HOLD_FULFILLMENT_STATUS;
          return (
            <li key={storeId} className="space-y-1">
              {shipment.fulfillmentProvider ? (
                <p className="sop-body-sm-regular text-sop-neutral-gray-300">
                  ขนส่ง:{' '}
                  <span className="sop-body-sm-medium text-sop-neutral-gray-200">
                    {shipment.fulfillmentProvider}
                  </span>
                </p>
              ) : null}
              {shipment.trackingNumber ? (
                <p className="sop-body-sm-regular text-sop-neutral-gray-300">
                  เลขพัสดุ:{' '}
                  <span className="sop-body-sm-medium text-sop-neutral-gray-200">
                    {shipment.trackingNumber}
                  </span>
                </p>
              ) : null}
              {shipment.fulfillmentStatus ? (
                <p className="sop-body-sm-regular text-sop-neutral-gray-300">
                  สถานะจัดส่ง:{' '}
                  <span className="sop-body-sm-medium text-sop-neutral-gray-200">
                    {labelFulfillmentStatus(shipment.fulfillmentStatus)}
                  </span>
                </p>
              ) : null}
              {isHeld ? (
                <p
                  className="sop-body-xs-regular text-sop-system-warning-500"
                  data-testid="shipment-hold-hint"
                >
                  {STORE_SUSPENSION_HOLD_COPY.holdItemHint}
                </p>
              ) : null}
              {shipment.trackingUrl && !isHeld ? (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex sop-body-sm-medium text-sop-secondary-500 underline"
                >
                  เปิดลิงก์ติดตามพัสดุ
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </AccountCard>
  );
}
