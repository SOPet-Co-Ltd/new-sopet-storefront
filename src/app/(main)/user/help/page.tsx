'use client';

import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';

const FAQ_ITEMS = [
  {
    question: 'วิธีสั่งซื้อสินค้าบน SOPet',
    answer:
      'เลือกสินค้าที่ต้องการ กดเพิ่มลงตะกร้า จากนั้นไปที่หน้าชำระเงินและกรอกข้อมูลการจัดส่ง ชำระเงินตามช่องทางที่เลือก ระบบจะยืนยันคำสั่งซื้อให้ทันที',
  },
  {
    question: 'ติดตามสถานะคำสั่งซื้อได้อย่างไร',
    answer:
      'เข้าสู่ระบบแล้วไปที่เมนู "คำสั่งซื้อสินค้า" ในโปรไฟล์ของคุณเพื่อดูสถานะคำสั่งซื้อ',
  },
  {
    question: 'ขอคืนสินค้าได้อย่างไร',
    answer:
      'เปิดรายละเอียดคำสั่งซื้อ กด "ขอคืนสินค้า" เลือกประเภทปัญหาและระบุรายละเอียด ทีมงานจะตรวจสอบและติดต่อกลับ',
  },
  {
    question: 'เปลี่ยนที่อยู่จัดส่งอย่างไร',
    answer:
      'ไปที่เมนู "ที่อยู่สำหรับจัดส่ง" ในโปรไฟล์ สามารถเพิ่ม แก้ไข ลบ หรือตั้งเป็นที่อยู่หลักได้',
  },
  {
    question: 'ติดต่อฝ่ายบริการลูกค้า',
    answer:
      'หากต้องการความช่วยเหลือเพิ่มเติม กรุณาติดต่อทีมงานผ่านช่องทางที่ระบุบนเว็บไซต์หรืออีเมล support@sopet.co.th',
  },
];

export default function UserHelpPage() {
  return (
    <AccountLayout title="ศูนย์ช่วยเหลือ">
      <div className="max-w-2xl space-y-4">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-4"
          >
            <summary className="cursor-pointer sop-body-sm-medium text-sop-neutral-gray-200">
              {item.question}
            </summary>
            <p className="mt-3 sop-body-sm-regular text-sop-neutral-gray-400">{item.answer}</p>
          </details>
        ))}

        <div className="rounded-sop-12px border border-sop-primary-200 bg-sop-primary-50 p-4">
          <p className="sop-body-sm-medium text-sop-neutral-gray-200">ต้องการความช่วยเหลือเพิ่มเติม?</p>
          <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-400">
            ดูคำสั่งซื้อหรือคำขอคืนสินค้าของคุณได้จากเมนูด้านซ้าย
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/user/orders" className="sop-body-sm-medium text-sop-secondary-500 underline">
              คำสั่งซื้อ
            </Link>
            <Link href="/user/returns" className="sop-body-sm-medium text-sop-secondary-500 underline">
              คำขอคืนสินค้า
            </Link>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
