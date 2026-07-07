'use client';

import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';

const SETTINGS_LINKS = [
  { href: '/user/profile', label: 'ข้อมูลส่วนตัว' },
  { href: '/user/addresses', label: 'ที่อยู่สำหรับจัดส่ง' },
  { href: '/user/credit', label: 'บัตรเครดิต/เดบิต' },
  { href: '/user/notifications', label: 'การแจ้งเตือน' },
  { href: '/user/help', label: 'ศูนย์ช่วยเหลือ' },
  { href: '/user/delete', label: 'คำขอลบบัญชี' },
];

export default function UserSettingsPage() {
  return (
    <AccountLayout title="การตั้งค่า">
      <div className="grid gap-3 sm:grid-cols-2">
        {SETTINGS_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white px-4 py-3 sop-body-sm-medium text-sop-neutral-gray-200 transition-colors hover:border-sop-primary-300 hover:bg-sop-primary-50"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </AccountLayout>
  );
}
