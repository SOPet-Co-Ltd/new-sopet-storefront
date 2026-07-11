import Link from 'next/link';

export function OrderTrackingNotFoundState() {
  return (
    <div role="alert" className="py-8 text-center" data-testid="order-tracking-not-found">
      <h1 className="mb-3 sop-headline-sm-medium text-sop-neutral-gray-200">ไม่พบคำสั่งซื้อ</h1>
      <p className="mb-6 sop-body-sm-regular text-sop-neutral-gray-400">
        ไม่พบคำสั่งซื้อที่คุณค้นหา กรุณาตรวจสอบลิงก์จากผู้ขายอีกครั้ง
      </p>
      <Link href="/" className="sop-body-sm-medium text-sop-primary-500 hover:underline">
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
