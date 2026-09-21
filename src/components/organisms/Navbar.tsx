'use client';

import Link from 'next/link';

import { Bag5Icon, BellIcon, LineIcon, ProfileIcon, SOPetLogo } from '../atoms/icons';
import { NavbarSearch } from '../molecules/NavbarSearch';
import { NavbarUserMenu } from '../molecules/NavbarUserMenu';
import { UnreadBadge } from '../molecules/UnreadBadge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/lib/providers/CartProvider';
import { useLoginModal } from '@/lib/providers/LoginModalProvider';

const LINE_OA_URL = 'https://line.me/R/ti/p/@sopet';

function NavbarCartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex"
      aria-label={itemCount > 0 ? `ตะกร้าสินค้า ${itemCount} ชิ้น` : 'ตะกร้าสินค้า'}
      data-fly-to-cart-target=""
    >
      <Bag5Icon size={{ mobile: 24, desktop: 24 }} color="#454547" aria-hidden="true" />
      {itemCount > 0 && (
        <span
          className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-sop-primary-500 px-1 sop-body-2xs-regular text-sop-base-white"
          data-testid="cart-badge-count"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}

function PromoBar() {
  const { isAuthenticated, isLoading } = useAuth();
  const { openLoginModal } = useLoginModal();

  return (
    <div className="sop-gradient-01 flex h-12 min-w-0 items-center justify-center overflow-hidden px-2 md:justify-between md:gap-3 md:px-sop-48px">
      <p className="sop-body-sm-regular min-w-0 truncate text-center text-sop-base-white md:text-left">
        <span className="sop-body-sm-medium">สมัครสมาชิก</span>
        {'Sopet สนับสนุนโดยสถาบันนวัตกรรมบูรณาการแห่งจุฬาฯ (CSII)'}
      </p>
      {isLoading ? (
        <div className="hidden h-6 w-[120px] animate-pulse rounded-sop-36 bg-sop-base-white/30 md:block" />
      ) : isAuthenticated ? (
        <NavbarUserMenu variant="desktop" />
      ) : (
        <button
          type="button"
          onClick={() => openLoginModal()}
          className="hidden cursor-pointer items-center gap-2 sop-body-sm-regular text-sop-base-white md:inline-flex"
        >
          <ProfileIcon size={{ mobile: 24, desktop: 24 }} color="#FFFFFF" aria-hidden="true" />
          เข้าสู่ระบบ | ลงทะเบียน
        </button>
      )}
    </div>
  );
}

export function Navbar() {
  return (
    <section>
      <PromoBar />
      <div className="flex min-w-0 items-center justify-between bg-sop-neutral-whitealpha-700 px-4 py-2.5 backdrop-blur-md md:px-sop-80px">
        <div className="flex w-full min-w-0 items-center justify-start gap-2 md:gap-6">
          <Link href="/" aria-label="SOPet หน้าหลัก" className="shrink-0">
            <SOPetLogo size={{ mobile: 45, desktop: 45 }} aria-hidden="true" />
          </Link>
          <NavbarSearch />
          <div className="flex shrink-0 items-center gap-4">
            <Link
              href="/user/notifications"
              aria-label="การแจ้งเตือน"
              className="hidden shrink-0 md:block"
            >
              <p className="relative">
                <BellIcon size={{ mobile: 24, desktop: 24 }} color="#454547" aria-hidden="true" />
                <UnreadBadge />
              </p>
            </Link>
            <NavbarCartButton />
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 items-center justify-center gap-2 rounded-sop-32 border border-sop-system-success-200 bg-sop-system-success-100 px-sop-32px shadow-[0_1px_2px_rgba(0,0,0,0.05)] md:inline-flex"
              aria-label="ติดตามสถานะผ่าน LINE"
            >
              <LineIcon size={{ mobile: 16, desktop: 16 }} aria-hidden="true" />
              <span className="sop-body-sm-medium text-sop-system-success-500">ติดตามสถานะ</span>
            </a>
            <NavbarUserMenu variant="mobile" />
          </div>
        </div>
      </div>
    </section>
  );
}
