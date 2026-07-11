import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OrderShipmentTrackingList } from './order-shipment-tracking-list';

/** Admin mirror: sopet-admin/src/lib/i18n/th.ts fulfillmentStatusLabels */
const ADMIN_MIRROR_LABELS: [status: string, label: string][] = [
  ['pending', 'รอดำเนินการ'],
  ['processing', 'กำลังเตรียม'],
  ['shipped', 'จัดส่งแล้ว'],
  ['delivered', 'ส่งถึงแล้ว'],
  ['cancelled', 'ยกเลิก'],
];

describe('OrderShipmentTrackingList', () => {
  // AC-018: Component hidden when no tracking metadata on any item.
  // Behavior: Items without provider, number, or URL → renders nothing.
  // @category: integration
  // @lane: integration
  it('renders nothing when no items have tracking data', () => {
    const { container } = render(
      <OrderShipmentTrackingList items={[{ storeId: 'store-1', fulfillmentStatus: 'pending' }]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  // AC-004: External carrier tracking links open safely in a new tab.
  // Behavior: trackingUrl set → link has rel="noopener noreferrer" and target="_blank".
  // @category: integration
  // @lane: integration
  it('renders tracking link with rel="noopener noreferrer"', () => {
    render(
      <OrderShipmentTrackingList
        items={[
          {
            storeId: 'store-1',
            trackingUrl: 'https://track.example.com/TH123',
            trackingNumber: 'TH123',
          },
        ]}
      />,
    );

    const link = screen.getByRole('link', { name: 'เปิดลิงก์ติดตามพัสดุ' });
    expect(link).toHaveAttribute('href', 'https://track.example.com/TH123');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // AC-018: Fulfillment status labels mirror admin map in rendered output.
  // Behavior: Known enum values → hardcoded Thai labels visible in shipment card.
  // @category: integration
  // @lane: integration
  it('maps known fulfillment statuses to Thai labels', () => {
    for (const [status, label] of ADMIN_MIRROR_LABELS) {
      const { unmount } = render(
        <OrderShipmentTrackingList
          items={[
            {
              storeId: `store-${status}`,
              trackingNumber: 'PKG-1',
              fulfillmentStatus: status,
            },
          ]}
        />,
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    }
  });

  // AC-018: Unknown fulfillment status falls back to raw enum string in UI.
  // Behavior: Unmapped status value → renders raw enum text.
  // @category: integration
  // @lane: integration
  it('falls back to raw enum string for unknown fulfillment status', () => {
    render(
      <OrderShipmentTrackingList
        items={[
          {
            storeId: 'store-1',
            trackingNumber: 'PKG-1',
            fulfillmentStatus: 'custom_status',
          },
        ]}
      />,
    );

    expect(screen.getByText('custom_status')).toBeInTheDocument();
  });

  // AC-018: Shipment card renders provider and tracking number inside AccountCard.
  // Behavior: Provider + tracking number → card wrapper with Thai heading and field values.
  // @category: integration
  // @lane: integration
  it('renders shipment card inside AccountCard wrapper', () => {
    render(
      <OrderShipmentTrackingList
        items={[
          {
            storeId: 'store-1',
            fulfillmentProvider: 'kerry',
            trackingNumber: 'TH123456789',
          },
        ]}
      />,
    );

    expect(screen.getByTestId('account-card')).toBeInTheDocument();
    expect(screen.getByText('ติดตามพัสดุ')).toBeInTheDocument();
    expect(screen.getByText('kerry')).toBeInTheDocument();
    expect(screen.getByText('TH123456789')).toBeInTheDocument();
  });
});
