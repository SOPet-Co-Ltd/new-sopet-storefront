import Link from 'next/link';
import type { OrderQuery } from '@/lib/graphql/generated/graphql';
import { ProductThumbnail } from '@/components/molecules/ProductThumbnail/ProductThumbnail';
import { buildProductHref } from '@/components/organisms/ProductCard';
import { formatThaiDateTime } from '@/lib/datetime/formatThaiDatetime';
import { cn } from '@/lib/utils';

type OrderConfirmationOrder = NonNullable<OrderQuery['order']>;
type OrderConfirmationItem = OrderConfirmationOrder['items'][number];

function formatPrice(amount: number): string {
  return `฿${amount.toLocaleString('th-TH')}`;
}

type OrderConfirmationSummaryProps = {
  order: OrderConfirmationOrder;
};

function OrderConfirmationItemRow({ item }: { item: OrderConfirmationItem }) {
  const productHref = item.productId ? buildProductHref(item.productId) : null;
  const rowClassName =
    'flex items-start justify-between gap-4 border-b border-sop-neutral-grayalpha-100 pb-4 last:border-b-0 last:pb-0';

  const content = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <ProductThumbnail
          alt={item.productName}
          imageUrl={item.productImageUrl}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="sop-body-sm-medium text-sop-neutral-gray-200">{item.productName}</p>
          <p className="sop-body-xs-regular text-sop-neutral-gray-400">
            จำนวน {item.quantity} × {formatPrice(item.unitPrice)}
          </p>
        </div>
      </div>
      <p className="sop-body-sm-medium text-sop-neutral-gray-200">{formatPrice(item.subtotal)}</p>
    </>
  );

  if (!productHref) {
    return (
      <div className={rowClassName} data-testid="order-confirmation-item">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={productHref}
      className={cn(
        rowClassName,
        '-mx-2 rounded-sop-8px px-2 transition-colors hover:bg-sop-primary-50',
      )}
      data-testid="order-confirmation-item"
    >
      {content}
    </Link>
  );
}

export function OrderConfirmationSummary({ order }: OrderConfirmationSummaryProps) {
  return (
    <div
      className="w-full rounded-sop-24px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-6 shadow-sm md:p-8"
      data-testid="order-confirmation-summary"
    >
      <div className="mb-6 flex flex-col gap-2 border-b border-sop-neutral-grayalpha-200 pb-4">
        <h2 className="sop-body-lg-medium text-sop-neutral-gray-200">รายละเอียดคำสั่งซื้อ</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="sop-body-sm-regular text-sop-neutral-gray-300">
            เลขที่คำสั่งซื้อ:{' '}
            <span className="sop-body-sm-medium text-sop-secondary-500">{order.orderNumber}</span>
          </p>
          <p className="sop-body-sm-regular text-sop-neutral-gray-300">
            วันที่สั่งซื้อ: {formatThaiDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {order.items.map((item) => (
          <OrderConfirmationItemRow key={item.id} item={item} />
        ))}
      </div>

      {order.storeShippings.length > 0 ? (
        <div className="mt-6 space-y-2 border-t border-sop-neutral-grayalpha-200 pt-4">
          <p className="sop-body-sm-medium text-sop-neutral-gray-200">การจัดส่ง</p>
          {order.storeShippings.map((shipping) => (
            <div key={shipping.storeId} className="flex justify-between sop-body-sm-regular text-sop-neutral-gray-300">
              <span>{shipping.optionName}</span>
              <span>{formatPrice(shipping.shippingFee)}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 space-y-2 border-t border-sop-neutral-grayalpha-200 pt-4">
        <div className="flex justify-between sop-body-sm-regular text-sop-neutral-gray-300">
          <span>ยอดรวมสินค้า</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between sop-body-sm-regular text-sop-neutral-gray-300">
          <span>ค่าจัดส่ง</span>
          <span>{formatPrice(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 ? (
          <div className="flex justify-between sop-body-sm-regular text-sop-system-success-500">
            <span>ส่วนลด</span>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        ) : null}
        <div className="flex justify-between pt-2 sop-body-md-medium text-sop-secondary-600">
          <span>ยอดชำระเงิน</span>
          <span data-testid="order-confirmation-total">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
