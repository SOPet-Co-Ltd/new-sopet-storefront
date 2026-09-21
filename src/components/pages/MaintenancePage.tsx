type MaintenancePageProps = {
  title: string;
  message: string;
  untilLabel?: string | null;
};

export default function MaintenancePage({ title, message, untilLabel }: MaintenancePageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-sm font-medium tracking-wide text-sop-neutral-gray-300 uppercase">Sopet</p>
      <h1 className="sop-headline-md-medium max-w-lg text-sop-neutral-gray-100">{title}</h1>
      <p className="max-w-md text-sop-neutral-gray-300">{message}</p>
      {untilLabel ? (
        <p className="max-w-md text-sm text-sop-neutral-gray-300">{untilLabel}</p>
      ) : null}
    </main>
  );
}
