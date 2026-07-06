"use client"

import Link from "next/link"

import {
  ClipboardAddIcon,
  LinkIcon,
  SaleIcon,
  ShieldCheckIcon,
  SOPetLogo,
  UserManagementBellIcon,
  UserManagementShoppingBagIcon,
} from "../atoms/icons"
import { NavbarSearch } from "../molecules/NavbarSearch"
import { NavbarUserMenu } from "../molecules/NavbarUserMenu"
import { UnreadBadge } from "../molecules/UnreadBadge"

function NavbarCartButton() {
  return (
    <Link
      href="/cart"
      className="relative inline-flex"
      aria-label="ตะกร้าสินค้า"
    >
      <UserManagementShoppingBagIcon
        size={{ mobile: 18, desktop: 18 }}
        color="#454547"
        aria-hidden="true"
      />
    </Link>
  )
}

function PromoBar() {
  const promoItems = [
    { icon: SaleIcon, label: "ส่วนลดพิเศษ" },
    { icon: ClipboardAddIcon, label: "ปรึกษาทุกปัญหา" },
    { icon: LinkIcon, label: "สัตวแพทย์แนะนำ" },
    { icon: ShieldCheckIcon, label: "ของแท้ 100%" },
  ] as const

  return (
    <div className="sop-gradient-01 px-sop-4px md:px-sop-48px py-sop-4px flex h-10 items-center justify-between md:justify-end md:gap-3">
      {promoItems.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-0.5 rounded-full bg-sop-neutral-whitealpha-100 md:gap-2"
        >
          <div className="flex aspect-square items-center justify-center rounded-full bg-sop-primary-100 p-1.5">
            <Icon size={{ mobile: 10, desktop: 10 }} color="#9C6ADE" />
          </div>
          <p className="sop-body-2xs-regular md:sop-body-xs-regular text-sop-base-white pr-1.5">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}

export function Navbar() {
  return (
    <section>
      <PromoBar />
      <div className="flex items-center justify-between bg-sop-neutral-whitealpha-700 px-4 py-2 md:px-20 md:py-3">
        <div className="flex w-full items-center justify-start gap-2 md:gap-6">
          <Link href="/" aria-label="SOPet หน้าหลัก">
            <SOPetLogo size={{ mobile: 45, desktop: 45 }} aria-hidden="true" />
          </Link>
          <NavbarSearch />
          <Link href="/user/notifications" aria-label="การแจ้งเตือน">
            <p className="relative">
              <UserManagementBellIcon
                size={{ mobile: 18, desktop: 18 }}
                color="#454547"
                aria-hidden="true"
              />
              <UnreadBadge />
            </p>
          </Link>
          <NavbarCartButton />
          <NavbarUserMenu variant="desktop" />
          <NavbarUserMenu variant="mobile" />
        </div>
      </div>
    </section>
  )
}
