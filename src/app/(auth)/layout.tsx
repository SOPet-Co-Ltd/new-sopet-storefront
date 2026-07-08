import { Header } from '@/components/organisms/Header';

const FLOW_MAIN_CLASS = 'flex flex-1 flex-col min-h-0';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className={FLOW_MAIN_CLASS}>
        <div className="flex flex-1 flex-col items-center justify-start px-sop-16px pb-sop-24px pt-10 sm:pt-16">
          {children}
        </div>
      </main>
    </>
  );
}
