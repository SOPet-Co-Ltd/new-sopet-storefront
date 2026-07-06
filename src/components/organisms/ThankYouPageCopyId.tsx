"use client"

import { toast } from "sonner";
import { CopyIcon } from "../atoms/icons/outline";

interface ThankYouPageCopyIdProps {
  id: string;
}

export default function ThankYouPageCopyId({ id }: ThankYouPageCopyIdProps) {
  return (
    <button
      type="button"
      className="cursor-pointer hover:opacity-80 transition-opacity duration-300"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(id)
          toast.success("คัดลอกรหัสคำสั่งซื้อแล้ว")
        } catch {
          toast.error("ไม่สามารถคัดลอกรหัสคำสั่งซื้อได้")
        }
      }}
      aria-label="คัดลอกรหัสคำสั่งซื้อ"
    >
      <CopyIcon size={{ mobile: 14, desktop: 14 }} color="#949495" />
    </button>
  );
}
