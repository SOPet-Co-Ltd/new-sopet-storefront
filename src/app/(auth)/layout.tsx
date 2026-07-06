const FLOW_MAIN_CLASS = 'flex flex-1 flex-col min-h-0';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className={FLOW_MAIN_CLASS}>
      <div className="flex flex-1 flex-col items-center justify-center px-sop-16px py-sop-24px">
        {children}
      </div>
    </main>
  );
}
