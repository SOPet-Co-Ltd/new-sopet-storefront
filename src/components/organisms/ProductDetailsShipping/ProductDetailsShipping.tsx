'use client';

export default function ProductDetailsShipping() {
  return (
    <details className="border border-sop-neutral-grayalpha-200 rounded-sop-8px p-4">
      <summary className="sop-body-md-medium text-sop-neutral-gray-300 cursor-pointer">
        การจัดส่งและการคืนสินค้า
      </summary>
      <ul className="mt-4 list-disc pl-5 sop-body-sm-regular text-sop-neutral-gray-400 flex flex-col gap-2">
        <li>จัดส่งฟรีทั่วประเทศไทยสำหรับคำสั่งซื้อที่มีสินค้าพร้อมจัดส่ง</li>
        <li>สินค้าจะถูกจัดส่งภายใน 3-5 วันทำการหลังยืนยันคำสั่งซื้อ</li>
        <li>รับคืนสินค้าภายใน 7 วันหากสินค้ามีปัญหาหรือไม่ตรงตามที่ระบุ</li>
      </ul>
    </details>
  );
}
