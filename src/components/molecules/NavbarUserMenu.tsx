'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  createAccountPagePrefetchHandlers,
  prefetchAccountPage,
} from '@/lib/account/prefetchAccountPage';
import type { CustomerProfile } from '@/lib/graphql/generated/graphql';
import {
  getNavItems,
  type AccountNavItem,
} from '@/components/templates/AccountLayout/accountNavConfig';

import type { FilledIconProps } from '../atoms/icons/FilledIcon';
import {
  CloseIcon,
  MenuNavIcon,
  ProfileIcon,
  SignInIcon,
  SignOutIcon,
  UserManagementBellIcon,
  UserManagementBinIcon,
  UserManagementCardIcon,
  UserManagementClipboardIcon,
  UserManagementHeartIcon,
  UserManagementLocationIcon,
  UserManagementUserIcon,
} from '../atoms/icons';

type NavbarUserMenuProps = {
  variant: 'desktop' | 'mobile';
};

export const NAVBAR_SEGMENT_ICONS: Record<
  string,
  ComponentType<Omit<FilledIconProps, 'children'>>
> = {
  profile: UserManagementUserIcon,
  orders: UserManagementClipboardIcon,
  addresses: UserManagementLocationIcon,
  credit: UserManagementCardIcon,
  notifications: UserManagementBellIcon,
  favorites: UserManagementHeartIcon,
  delete: UserManagementBinIcon,
};

const MOBILE_SEPARATOR_SEGMENTS = new Set(['favorites', 'delete']);
const MOBILE_COLORED_SEGMENTS = new Set(['profile']);

const NAVBAR_MENU_ITEMS = getNavItems('showInNavbarMenu');

function getDisplayName(customer: CustomerProfile): string {
  return customer.fullName?.trim() || customer.email?.trim() || customer.phone || '';
}

function UserAvatar({
  customer,
  size = 'xsmall',
}: {
  customer: CustomerProfile;
  size?: 'promo' | 'xsmall' | 'small';
}) {
  const displayName = getDisplayName(customer);
  const sizeClasses =
    size === 'promo'
      ? 'h-6 w-6 text-xs'
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

function DrawerListItem({
  icon,
  label,
  onClick,
  separator,
  colored,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  separator?: boolean;
  colored?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5',
        colored ? 'bg-sop-primary-200' : 'bg-transparent',
        separator && 'border-b border-sop-neutral-gray-500',
      )}
      onClick={() => {
        void onClick?.();
      }}
    >
      {icon}
      <p className="sop-body-sm-regular">{label}</p>
    </button>
  );
}

function NavbarMenuLink({ item, onNavigate }: { item: AccountNavItem; onNavigate: () => void }) {
  const router = useRouter();
  const segment = item.segment ?? '';
  const Icon = NAVBAR_SEGMENT_ICONS[segment];
  const prefetchHandlers = createAccountPagePrefetchHandlers(item.href, () =>
    router.prefetch(item.href),
  );

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5',
        MOBILE_COLORED_SEGMENTS.has(segment) && 'bg-sop-primary-200',
        MOBILE_SEPARATOR_SEGMENTS.has(segment) && 'border-b border-sop-neutral-gray-500',
      )}
      {...prefetchHandlers}
    >
      {Icon ? <Icon size={{ mobile: 14, desktop: 14 }} color="#454547" /> : null}
      <p className="sop-body-sm-regular">{item.label}</p>
    </Link>
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
  const router = useRouter();
  const isClient = useSyncExternalStore(
    subscribeIsClient,
    () => true,
    () => false,
  );
  const displayName = customer ? getDisplayName(customer) : '';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      NAVBAR_MENU_ITEMS.forEach((item) => {
        router.prefetch(item.href);
        prefetchAccountPage(item.href);
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, router]);

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

  const drawerContent = (
    <div
      role="presentation"
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 ease-out',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
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
          'absolute top-0 right-0 z-10 h-full h-dvh w-[75%] max-w-xs overflow-y-auto bg-sop-base-white shadow-2xl',
          'transition duration-200 ease-out',
          open ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0',
        )}
      >
        <div className="flex h-[92px] items-end justify-end px-[17px] py-[21px]">
          <button
            type="button"
            className="inline-flex aspect-square min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center rounded-xl bg-sop-primary-500 p-sop-8px"
            aria-label="ปิดเมนูผู้ใช้"
            onClick={onClose}
          >
            <CloseIcon size={{ mobile: 16, desktop: 16 }} color="#fff" />
          </button>
        </div>

        <div className="flex flex-col">
          {!isAuthenticated || !customer ? (
            <Link
              href="/login"
              onClick={onClose}
              className="flex w-full items-center gap-3 bg-sop-primary-200 px-4 py-2.5"
            >
              <SignInIcon size={{ mobile: 14, desktop: 14 }} color="#454547" />
              <p className="sop-body-sm-regular">เข้าสู่ระบบ</p>
            </Link>
          ) : (
            <>
              <div className="mb-5 flex h-sop-56px items-center gap-sop-16px px-4">
                <UserAvatar customer={customer} size="small" />
                <span className="sop-body-sm-regular">{displayName}</span>
              </div>
              {NAVBAR_MENU_ITEMS.map((item) => (
                <NavbarMenuLink key={item.href} item={item} onNavigate={onClose} />
              ))}
              <DrawerListItem
                icon={<SignOutIcon size={{ mobile: 14, desktop: 14 }} color="#454547" />}
                label="ออกจากระบบ"
                separator
                onClick={async () => {
                  onClose();
                  await logout();
                }}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );

  if (!isClient) {
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
