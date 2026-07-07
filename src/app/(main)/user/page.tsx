'use client';

import Link from 'next/link';
import { AccountLayout } from '@/components/templates/AccountLayout/AccountLayout';
import { ACCOUNT_NAV_ITEMS } from '@/components/templates/AccountLayout/accountNavConfig';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatThaiPhoneNumber } from '@/lib/helpers/phone';

const DASHBOARD_LINKS = ACCOUNT_NAV_ITEMS.filter((item) => item.href !== '/user');

export default function UserDashboardPage() {
  const { customer } = useAuth();

  return (
    <AccountLayout title="ภาพรวมบัญชี">
      <div className="space-y-6">
        <div className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white p-6">
          <p className="sop-body-sm-regular text-sop-neutral-gray-400">ยินดีต้อนรับ</p>
          <p className="mt-1 sop-body-lg-medium text-sop-neutral-gray-200">
            {customer?.fullName?.trim() || 'สมาชิก SOPet'}
          </p>
          {customer?.phone ? (
            <p className="mt-1 sop-body-sm-regular text-sop-neutral-gray-300">
              {formatThaiPhoneNumber(customer.phone)}
            </p>
          ) : null}
          {customer?.email ? (
            <p className="sop-body-sm-regular text-sop-neutral-gray-300">{customer.email}</p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {DASHBOARD_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sop-12px border border-sop-neutral-grayalpha-200 bg-sop-base-white px-4 py-3 sop-body-sm-medium text-sop-neutral-gray-200 transition-colors hover:border-sop-primary-300 hover:bg-sop-primary-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </AccountLayout>
  );
}
