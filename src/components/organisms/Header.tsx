import Link from "next/link"
import {
  Bag5Icon,
  BellIcon,
  ClipboardAddIcon,
  LikeIcon,
  SaleIcon,
  ShieldCheckIcon,
  SOPetLogo,
} from "../atoms/icons"
import { NavbarSearch } from "../molecules/NavbarSearch"
import { NavbarUserMenu } from "../molecules/NavbarUserMenu"
import { UnreadBadge } from "../molecules/UnreadBadge"

export function Header() {
  return (
    <header aria-label="Site header">
      <div className="sop-gradient-01 px-sop-4px md:px-sop-48px py-sop-4px flex md:justify-end justify-between items-center md:gap-3 h-10">
        <div className="flex gap-0.5 md:gap-2 rounded-full items-center bg-sop-neutral-whitealpha-100">
          <div className="bg-sop-primary-100 rounded-full aspect-square flex justify-center items-center p-1.5">
            <SaleIcon size={{ mobile: 10 }} color="#9C6ADE" />
          </div>
          <p className="sop-body-2xs-regular md:sop-body-xs-regular text-sop-base-white pr-1.5">
            ส่วนลดพิเศษ
          </p>
        </div>
        <div className="flex gap-0.5 md:gap-2 rounded-full items-center bg-sop-neutral-whitealpha-100">
          <div className="bg-sop-primary-100 rounded-full aspect-square flex justify-center items-center p-1.5">
            <ClipboardAddIcon size={{ mobile: 10 }} color="#9C6ADE" />
          </div>
          <p className="sop-body-2xs-regular md:sop-body-xs-regular text-sop-base-white pr-1.5">
            ปรึกษาทุกปัญหา
          </p>
        </div>
        <div className="flex gap-0.5 md:gap-2 rounded-full items-center bg-sop-neutral-whitealpha-100">
          <div className="bg-sop-primary-100 rounded-full aspect-square flex justify-center items-center p-1.5">
            <LikeIcon size={{ mobile: 10 }} color="#9C6ADE" />
          </div>
          <p className="sop-body-2xs-regular md:sop-body-xs-regular text-sop-base-white pr-1.5">
            สัตวแพทย์แนะนำ
          </p>
        </div>
        <div className="flex gap-0.5 md:gap-2 rounded-full items-center bg-sop-neutral-whitealpha-100">
          <div className="bg-sop-primary-100 rounded-full aspect-square flex justify-center items-center p-1.5">
            <ShieldCheckIcon size={{ mobile: 10 }} color="#9C6ADE" />
          </div>
          <p className="sop-body-2xs-regular md:sop-body-xs-regular text-sop-base-white pr-1.5">
            ของแท้ 100%
          </p>
        </div>
      </div>
      <div className="bg-sop-neutral-whitealpha-700 flex items-center justify-between md:px-20 px-4 md:py-3 py-2">
        <div className="flex justify-start items-center md:gap-6 gap-2 w-full">
          <Link href="/" aria-label="SOPet หน้าหลัก">
            <SOPetLogo size={{ mobile: 45, desktop: 45 }} aria-hidden="true" />
          </Link>
          <NavbarSearch />
          <Link
            href="/user/notifications"
            aria-label="การแจ้งเตือน"
          >
            <p className="relative">
              <BellIcon
                size={{ mobile: 18, desktop: 18 }}
                color="#454547"
                aria-hidden="true"
              />
              <UnreadBadge />
            </p>
          </Link>

          <Link
            href="/user/cart"
            aria-label="ตะกร้าสินค้า"
          >
            <p>
              <Bag5Icon
                size={{ mobile: 18, desktop: 18 }}
                color="#454547"
                aria-hidden="true"
              />
            </p>
          </Link>

          <NavbarUserMenu />
        </div>
      </div>

    </header>
  )
}

// <div className="hidden md:block">
//   {user ? (
//     <UserDropdown user={user} />
//   ) : (
//     <Link href="/login">
//       {/* TODO - Add login button */}
//       <Button className="hidden md:block" size="md" variant="primary">
//         เข้าสู่ระบบ
//       </Button>
//     </Link>
//   )}
// </div>
// <div className="block md:hidden">
//   {/* <UserDropdownMobile user={user} /> */}
// </div>