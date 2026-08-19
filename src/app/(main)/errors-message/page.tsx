import type { Metadata } from 'next';
import { ErrorMessagesPage } from '@/components/pages/ErrorMessagesPage';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'รหัสข้อผิดพลาด',
  description:
    'ค้นหารหัสข้อผิดพลาดของระบบ ความหมายภาษาไทย และคำอธิบายเพิ่มเติมสำหรับผู้ใช้',
  path: '/errors-message',
  robots: { index: false, follow: false },
});

export default function ErrorsMessageRoute() {
  return <ErrorMessagesPage />;
}
