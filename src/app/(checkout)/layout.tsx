import { Header } from '@/components/organisms/Header';

const FLOW_MAIN_CLASS = 'flex flex-1 flex-col min-h-0';

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className={FLOW_MAIN_CLASS}>{children}</main>
    </>
  );
}
