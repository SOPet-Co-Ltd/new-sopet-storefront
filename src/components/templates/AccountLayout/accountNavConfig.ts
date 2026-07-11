export type NavVisibilityFlag =
  'showInSidebar' | 'showInMobileNav' | 'showInNavbarMenu' | 'showInSettings';

export type AccountNavItem = {
  href: string;
  label: string;
  segment?: string;
  showInSidebar: boolean;
  showInMobileNav: boolean;
  showInNavbarMenu: boolean;
  showInSettings: boolean;
};

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    href: '/user/profile',
    label: 'ข้อมูลส่วนตัว',
    segment: 'profile',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: true,
  },
  {
    href: '/user/orders',
    label: 'คำสั่งซื้อสินค้า',
    segment: 'orders',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: false,
  },
  {
    href: '/user/addresses',
    label: 'ที่อยู่สำหรับจัดส่ง',
    segment: 'addresses',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: true,
  },
  {
    href: '/user/favorites',
    label: 'รายการโปรด',
    segment: 'favorites',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: false,
  },
  {
    href: '/user/reviews',
    label: 'รีวิวสินค้า',
    segment: 'reviews',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: false,
    showInSettings: false,
  },
  {
    href: '/user/notifications',
    label: 'การแจ้งเตือน',
    segment: 'notifications',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: true,
  },
  {
    href: '/user/credit',
    label: 'บัตรเครดิต/เดบิต',
    segment: 'credit',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: true,
  },
  {
    href: '/user/delete',
    label: 'คำขอลบบัญชี',
    segment: 'delete',
    showInSidebar: true,
    showInMobileNav: true,
    showInNavbarMenu: true,
    showInSettings: true,
  },
];

export function getNavItems(filter: NavVisibilityFlag): AccountNavItem[] {
  return ACCOUNT_NAV_ITEMS.filter((item) => item[filter]);
}

export function isAccountNavActive(pathname: string, href: string): boolean {
  const path = pathname.split('?')[0];

  if (path === href) {
    return true;
  }

  return path.startsWith(`${href}/`) || path.startsWith(href);
}

export function getAccountNavLabel(pathname: string): string | undefined {
  const path = pathname.split('?')[0];
  const match = ACCOUNT_NAV_ITEMS.find(
    (item) => path === item.href || path.startsWith(`${item.href}/`),
  );
  return match?.label;
}
