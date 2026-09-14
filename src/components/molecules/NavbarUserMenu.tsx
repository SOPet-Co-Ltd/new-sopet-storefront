'use client';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

const subscribeIsClient = () => () => {};

import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { CustomerProfile } from '@/lib/graphql/generated/graphql';

import type { FilledIconProps } from '../atoms/icons/FilledIcon';
import type { InlineIconProps } from '../atoms/icons/InlineIcon';
import type { OutlineIconProps } from '../atoms/icons/OutlineIcon';
import {
  Bag5Icon,
  BellIcon,
  CaretRightIcon,
  CloseIcon,
  LineIcon,
  MenuNavIcon,
  ProfileIcon,
  QrAddLineOAIcon,
  SignOutIcon,
  SOPetLogo,
  UserManagementHelpIcon,
  UserManagementHeartIcon,
} from '../atoms/icons';

const LINE_OA_URL = 'https://line.me/R/ti/p/@sopet';
const ICON_PRIMARY = '#9c6ade';
const ICON_GRAY = '#454547';
const DRAWER_ANIMATION_MS = 300;

type NavbarUserMenuProps = {
  variant: 'desktop' | 'mobile';
};

type NavIcon = ComponentType<
  | Omit<FilledIconProps, 'children'>
  | Omit<InlineIconProps, 'children'>
  | Omit<OutlineIconProps, 'children'>
>;

type DrawerNavItem = {
  key: string;
  label: string;
  href?: string;
  external?: boolean;
  Icon: NavIcon;
  authOnly?: boolean;
  onClick?: () => void | Promise<void>;
};

function getDisplayName(customer: CustomerProfile): string {
  return customer.fullName?.trim() || customer.email?.trim() || customer.phone || '';
}

function UserAvatar({
  customer,
  size = 'xsmall',
}: {
  customer: CustomerProfile;
  size?: 'promo' | 'xsmall' | 'small' | 'drawer';
}) {
  const displayName = getDisplayName(customer);
  const sizeClasses =
    size === 'promo'
      ? 'h-6 w-6 text-xs'
      : size === 'drawer'
        ? 'h-12 w-12 text-sm'
        : size === 'xsmall'
          ? 'h-sop-28px w-sop-28px text-sm'
          : 'h-sop-56px w-sop-56px text-sm';

  return (
    <div
      className={cn(
        'flex aspect-square items-center justify-center overflow-hidden rounded-full bg-sop-neutral-gray-500',
        sizeClasses,
      )}
      aria-hidden="true"
    >
      {customer.profilePhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={customer.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
      ) : displayName.charAt(0) ? (
        <span className="sop-body-xs-medium text-sop-primary-500">{displayName.charAt(0)}</span>
      ) : (
        <ProfileIcon size={{ mobile: 20, desktop: 20 }} />
      )}
    </div>
  );
}

function LineTrackButton({ className }: { className?: string }) {
  return (
    <a
      href={LINE_OA_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex h-11 w-full items-center justify-center gap-2 rounded-sop-32 border border-sop-system-success-200 bg-sop-system-success-100 px-sop-32px shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
        className,
      )}
      aria-label="ติดตามสถานะผ่าน LINE"
    >
      <LineIcon size={{ mobile: 16, desktop: 16 }} aria-hidden="true" />
      <span className="sop-body-sm-medium text-sop-system-success-500">ติดตามสถานะ</span>
    </a>
  );
}

function DrawerNavRow({
  icon,
  label,
  href,
  external,
  onClick,
  onNavigate,
  className,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void | Promise<void>;
  onNavigate: () => void;
  className?: string;
}) {
  const rowClassName = cn(
    'flex min-h-11 w-full py-sop-20px cursor-pointer items-center justify-between px-4 py-2 text-left text-sop-neutral-gray-300',
    'outline-none transition-colors',
    'hover:bg-sop-primary-100/60',
    'focus-visible:bg-sop-primary-100/60 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sop-primary-500',
    className,
  );

  const content = (
    <>
      <span className="flex items-center gap-3">
        {icon}
        <span className="sop-body-md-regular">{label}</span>
      </span>
      <CaretRightIcon size={{ mobile: 20, desktop: 20 }} color="#c4c4c6" aria-hidden="true" />
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={rowClassName}
          aria-label={`${label} (เปิดในแท็บใหม่)`}
          onClick={onNavigate}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={rowClassName} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={rowClassName}
      onClick={() => {
        onNavigate();
        void onClick?.();
      }}
    >
      {content}
    </button>
  );
}

function UserMenuDrawer({
  open,
  onClose,
  panelId,
  customer,
  isAuthenticated,
  logout,
}: {
  open: boolean;
  onClose: () => void;
  panelId: string;
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}) {
  const isClient = useSyncExternalStore(
    subscribeIsClient,
    () => true,
    () => false,
  );
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const displayName = customer ? getDisplayName(customer) : '';
  const showAuth = isAuthenticated && Boolean(customer);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      let cancelled = false;
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) {
            setVisible(true);
          }
        });
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
      };
    }

    setVisible(false);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = '';
    }, DRAWER_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const navItems: DrawerNavItem[] = [
    {
      key: 'cart',
      label: 'ตะกร้าสินค้า',
      href: '/cart',
      Icon: Bag5Icon,
    },
    {
      key: 'notifications',
      label: 'การแจ้งเตือน',
      href: '/user/notifications',
      Icon: BellIcon,
    },
    {
      key: 'favorites',
      label: 'รายการโปรด',
      href: '/user/favorites',
      Icon: UserManagementHeartIcon,
    },
    {
      key: 'help',
      label: 'ศูนย์ช่วยเหลือ',
      href: LINE_OA_URL,
      external: true,
      Icon: UserManagementHelpIcon,
    },
    {
      key: 'logout',
      label: 'ออกจากระบบ',
      Icon: SignOutIcon,
      authOnly: true,
      onClick: async () => {
        await logout();
      },
    },
  ];

  const visibleNavItems = navItems.filter((item) => !item.authOnly || showAuth);

  const drawerContent = (
    <div
      role="presentation"
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 bg-black/40 transition-opacity duration-300',
        visible ? 'opacity-100 ease-out' : 'pointer-events-none opacity-0 ease-in',
      )}
      onClick={onClose}
    >
      <section
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="เมนูผู้ใช้"
        onClick={(event) => event.stopPropagation()}
        className={cn(
          'absolute top-0 right-0 z-10 flex h-dvh w-[95%] max-w-[420px] flex-col overflow-y-auto bg-sop-base-white shadow-2xl',
          'px-4 pb-20 pt-5 transition-transform duration-300 will-change-transform',
          visible ? 'translate-x-0 ease-out' : 'pointer-events-none translate-x-full ease-in',
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="SOPet หน้าหลัก" className="p-2" onClick={onClose}>
              <SOPetLogo size={{ mobile: 48, desktop: 48 }} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="inline-flex size-7 cursor-pointer items-center justify-center"
              aria-label="ปิดเมนูผู้ใช้"
              onClick={onClose}
            >
              <CloseIcon size={{ mobile: 28, desktop: 28 }} color={ICON_GRAY} />
            </button>
          </div>

          {!showAuth ? (
            <div className="flex flex-col gap-6 rounded-sop-24 bg-sop-primary-200 p-6">
              <div className="flex flex-col gap-2 text-center text-sop-neutral-gray-300">
                <p className="sop-body-md-bold">ยินดีต้อนรับสู่ Sopet 🐾</p>
                <p className="sop-body-sm-regular">
                  เข้าสู่ระบบเพื่อติดตามคำสั่งซื้อ บันทึกรายการโปรด และรับสิทธิพิเศษสำหรับสมาชิก
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="inline-flex h-11 w-full items-center justify-center rounded-sop-36 bg-sop-primary-500 px-3 sop-body-md-medium text-sop-base-white"
                >
                  เข้าสู่ระบบ | ลงทะเบียน
                </Link>
                <LineTrackButton />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-sop-12 bg-sop-primary-200 px-3 py-4">
                <div className="flex min-w-0 items-center gap-2">
                  <UserAvatar customer={customer!} size="drawer" />
                  <div className="min-w-0">
                    <p className="truncate sop-body-sm-medium text-sop-neutral-gray-200">
                      {displayName}
                    </p>
                    <p className="sop-body-xs-regular text-sop-neutral-gray-300">สมาชิก Sopet</p>
                  </div>
                </div>
                <Link
                  href="/user/profile"
                  onClick={onClose}
                  className="shrink-0 sop-body-sm-medium text-sop-primary-500"
                >
                  บัญชีของฉัน
                </Link>
              </div>
              <LineTrackButton />
            </>
          )}

          <nav
            className="flex flex-col overflow-hidden rounded-sop-16 border border-sop-neutral-grayalpha-100"
            aria-label="เมนูหลัก"
          >
            {visibleNavItems.map((item, index) => (
              <DrawerNavRow
                key={item.key}
                icon={
                  <item.Icon
                    size={{ mobile: 24, desktop: 24 }}
                    color={ICON_PRIMARY}
                    aria-hidden="true"
                  />
                }
                label={item.label}
                href={item.href}
                external={item.external}
                onClick={item.onClick}
                onNavigate={onClose}
                className={index > 0 ? 'border-t border-sop-neutral-grayalpha-200' : undefined}
              />
            ))}
          </nav>
        </div>

        <a
          href={LINE_OA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center gap-6 rounded-sop-24 bg-sop-additionalgreen-200 p-3"
          aria-label="ปรึกษาสัตวแพทย์ และแอดมิน ผ่าน LINE OA"
          onClick={onClose}
        >
          <div className="flex h-[120px] w-[115px] shrink-0 items-center justify-center overflow-hidden rounded-[8.5px] border border-sop-system-success-400 bg-sop-base-white px-[30px] py-[15px]">
            <QrAddLineOAIcon
              size={{ mobile: 98, desktop: 98 }}
              color="#05D35E"
              aria-hidden="true"
            />
          </div>
          <p className="sop-body-lg-medium text-sop-neutral-gray-200">
            ปรึกษาสัตวแพทย์ และแอดมิน
            <br />
            ผ่าน LINE OA
          </p>
        </a>
      </section>
    </div>
  );

  if (!isClient || !mounted) {
    return null;
  }

  return createPortal(drawerContent, document.body);
}

function NavbarUserMenuDesktop() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (isLoading) {
    return (
      <div className="hidden h-6 w-[120px] animate-pulse rounded-sop-36 bg-sop-base-white/30 md:block" />
    );
  }

  // Guest auth CTAs live in the promo bar; keep desktop menu for authenticated users only.
  if (!isAuthenticated || !customer) {
    return null;
  }

  const displayName = getDisplayName(customer);

  return (
    <>
      <button
        type="button"
        className="hidden cursor-pointer items-center justify-center gap-2 rounded-sop-36 px-3 py-2 text-sop-base-white md:inline-flex"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={`เมนูผู้ใช้: ${displayName}`}
        onClick={() => setOpen(true)}
      >
        <UserAvatar customer={customer} size="promo" />
        <span className="sop-body-sm-medium max-w-[120px] truncate">{displayName}</span>
      </button>

      <UserMenuDrawer
        open={open}
        onClose={() => setOpen(false)}
        panelId={panelId}
        customer={customer}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />
    </>
  );
}

function NavbarUserMenuMobile() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (isLoading) {
    return (
      <div className="block h-4 w-4 animate-pulse rounded-full bg-sop-neutral-gray-500 md:hidden" />
    );
  }

  return (
    <div className="block shrink-0 md:hidden">
      <div className="flex items-center justify-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'ปิดเมนูผู้ใช้' : 'เปิดเมนูผู้ใช้'}
          onClick={() => setOpen(true)}
        >
          <MenuNavIcon size={{ mobile: 16, desktop: 16 }} color="#454547" />
        </button>
      </div>

      <UserMenuDrawer
        open={open}
        onClose={() => setOpen(false)}
        panelId={panelId}
        customer={customer}
        isAuthenticated={isAuthenticated}
        logout={logout}
      />
    </div>
  );
}

export function NavbarUserMenu({ variant }: NavbarUserMenuProps) {
  if (variant === 'mobile') {
    return <NavbarUserMenuMobile />;
  }

  return <NavbarUserMenuDesktop />;
}
