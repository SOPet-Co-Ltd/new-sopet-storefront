import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
