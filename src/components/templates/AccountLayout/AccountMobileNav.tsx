import { getNavItems, isAccountNavActive } from './accountNavConfig';
import { AccountNavLink } from './AccountSidebarNav';

type AccountMobileNavProps = {
  pathname: string;
};

export function AccountMobileNav({ pathname }: AccountMobileNavProps) {
  const items = getNavItems('showInMobileNav');

  return (
    <nav
      aria-label="เมนูบัญชีผู้ใช้ (มือถือ)"
      className="sticky top-20 z-10 -mx-4 bg-sop-base-white/95 px-4 py-2 backdrop-blur-sm lg:hidden"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <AccountNavLink
            key={item.href}
            active={isAccountNavActive(pathname, item.href)}
            href={item.href}
            label={item.label}
            layout="mobile"
          />
        ))}
      </div>
    </nav>
  );
}
