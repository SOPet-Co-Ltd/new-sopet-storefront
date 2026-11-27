'use client';

import { toast } from 'sonner';

function showSuccessToast(id: string, message: string) {
  toast.success(message, {
    id,
    duration: 4000,
  });
}

export function showSavedProductToast() {
  showSuccessToast('saved-product', 'บันทึกสินค้าแล้ว');
}

export function showAddedToCartToast() {
  showSuccessToast('added-to-cart', 'เพิ่มสินค้าลงตะกร้าแล้ว');
}
