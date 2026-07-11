import { Suspense } from 'react';
import { OtpVerifyForm } from '@/components/molecules/OtpVerifyForm/OtpVerifyForm';

export default function LoginOtpPage() {
  return (
    <Suspense
      fallback={<div className="sop-body-sm-regular text-sop-neutral-gray-400">กำลังโหลด...</div>}
    >
      <OtpVerifyForm />
    </Suspense>
  );
}
