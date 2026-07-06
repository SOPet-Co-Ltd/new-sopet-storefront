'use client'

import { useQuery } from "@apollo/client/react"
import Link from "next/link"
import { MeDocument } from "@/lib/graphql/generated/graphql"
import { MenuIcon } from "../atoms/icons/inline"
import { useIsMobile } from "@/hooks/useIsMobile"
import { Button } from "../atoms/Button"
import { CaretDownIcon } from "../atoms/icons/inline/CaretDownIcon"

export function NavbarUserMenu() {
  const { data, loading, error } = useQuery(MeDocument)

  const isMobile = useIsMobile()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-sop-neutral-200 animate-pulse" />
      </div>
    )
  }

  if (isMobile) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          className="flex items-center"
          aria-label="เมนูผู้ใช้"
        >
          <MenuIcon size={{ mobile: 16 }} color="#454547" />
        </button>
      </div>
    )
  }

  // if (error || !data?.me?.customer) {
  //   return (
  //     <Link href="/login">
  //       <Button>
  //         เข้าสู่ระบบ
  //       </Button>
  //     </Link>
  //   )
  // }

  // const customer = data.me.customer
  const customer: {
    id: string;
    phone: string;
    email: string | null;
    fullName: string | null;
  } = {
    id: "1234567890",
    fullName: "สมชาย สมหญิง",
    phone: "0812345678",
    email: "somchai@example.com",
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="flex items-center gap-2 hover:opacity-80 cursor-pointer"
        aria-label="เมนูผู้ใช้"
      >
        <div className="h-8 w-8 rounded-full bg-sop-primary-100 flex items-center justify-center">
          <span className="sop-body-xs-medium text-sop-primary-500">
            {customer.fullName?.charAt(0) || customer.phone.charAt(0)}
          </span>
        </div>
        <span className="sop-body-xs-regular text-sop-neutral-gray-200 flex items-center gap-1">
          {customer.fullName || customer.phone}
          <CaretDownIcon size={{ mobile: 16 }} color="#454547" />
        </span>
      </button>
    </div>
  );
}
