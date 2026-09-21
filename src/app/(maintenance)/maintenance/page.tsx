import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import MaintenancePage from '@/components/pages/MaintenancePage';
import {
  getMaintenancePageCopy,
  getStorefrontMaintenanceStatus,
} from '@/lib/maintenance/storefront-maintenance';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'ปิดปรับปรุงชั่วคราว',
  description: 'หน้าร้าน Sopet กำลังปิดปรับปรุงชั่วคราว กรุณากลับมาใหม่ภายหลัง',
  path: '/maintenance',
  robots: { index: false, follow: false },
});

export default async function Page() {
  const status = await getStorefrontMaintenanceStatus(fetch, { bypassCache: true });
  if (!status.enabled) {
    redirect('/');
  }

  const copy = getMaintenancePageCopy(status);
  return <MaintenancePage title={copy.title} message={copy.message} untilLabel={copy.untilLabel} />;
}
