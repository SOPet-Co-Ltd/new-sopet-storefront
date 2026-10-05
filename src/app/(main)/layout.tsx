import { Header } from '@/components/organisms/Header';
import { ConditionalFooter } from '@/components/organisms/ConditionalFooter';
import { PromotionalAdsModal } from '@/components/organisms/PromotionalAdsModal';
import { DEFAULT_SITE_TITLE_SEGMENT } from '@/lib/seo/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: DEFAULT_SITE_TITLE_SEGMENT,
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
