import { Header } from "@/components/organisms/Header";
import { ConditionalFooter } from "@/components/organisms/ConditionalFooter";
import { PromotionalAdsModal } from "@/components/organisms/PromotionalAdsModal";

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
