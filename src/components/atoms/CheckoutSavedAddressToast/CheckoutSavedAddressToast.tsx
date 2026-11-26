'use client';

import { toast } from 'sonner';

export const CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE = 'เข้าสู่ระบบแล้ว ดึงที่อยู่เดิมให้แล้ว';

export function showCheckoutSavedAddressToast() {
  toast.success(CHECKOUT_SAVED_ADDRESS_TOAST_MESSAGE, {
    id: 'checkout-saved-address',
    duration: 4000,
  });
}
