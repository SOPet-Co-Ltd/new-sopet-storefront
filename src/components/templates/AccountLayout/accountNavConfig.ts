export type AccountNavItem = {
  href: string;
  label: string;
  segment?: string;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  { href: '/user', label: 'ภาพรวมบัญชี' },
  { href: '/user/profile', label: 'ข้อมูลส่วนตัว', segment: 'profile' },
  { href: '/user/orders', label: 'คำสั่งซื้อสินค้า', segment: 'orders' },
  { href: '/user/addresses', label: 'ที่อยู่สำหรับจัดส่ง', segment: 'addresses' },
  { href: '/user/favorites', label: 'รายการโปรด', segment: 'favorites' },
  { href: '/user/wishlist', label: 'สินค้าที่บันทึก', segment: 'wishlist' },
  { href: '/user/reviews', label: 'รีวิวสินค้า', segment: 'reviews' },
  { href: '/user/notifications', label: 'การแจ้งเตือน', segment: 'notifications' },
  { href: '/user/credit', label: 'บัตรเครดิต/เดบิต', segment: 'credit' },
  { href: '/user/returns', label: 'คำขอคืนสินค้า', segment: 'returns' },
  { href: '/user/settings', label: 'การตั้งค่า', segment: 'settings' },
  { href: '/user/help', label: 'ศูนย์ช่วยเหลือ', segment: 'help' },
  { href: '/user/delete', label: 'คำขอลบบัญชี', segment: 'delete' },
];

export function getAccountNavLabel(pathname: string): string | undefined {
  const match = ACCOUNT_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label;
}
