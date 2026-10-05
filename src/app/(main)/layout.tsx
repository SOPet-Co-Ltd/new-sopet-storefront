import { Header } from '@/components/organisms/Header';
import { ConditionalFooter } from '@/components/organisms/ConditionalFooter';
import { PromotionalAdsModal } from '@/components/organisms/PromotionalAdsModal';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ยาสัตว์ออนไลน์ ของแท้ Nexgard, Apoquel, Cardisure และอีก 100 แบรนด์',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PromotionalAdsModal />
      <Header />
      {children}
      <ConditionalFooter />
    </>
  );
}
