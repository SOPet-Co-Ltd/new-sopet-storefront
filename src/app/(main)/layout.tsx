import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";
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
      <Footer />
    </>
  );
}
