"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react"

import { useAuth } from "@/lib/hooks/useAuth"
import { cn } from "@/lib/utils"
import {
  createAccountPagePrefetchHandlers,
  prefetchAccountPage,
} from "@/lib/account/prefetchAccountPage"
import type { CustomerProfile } from "@/lib/graphql/generated/graphql"
import {
  getNavItems,
  type AccountNavItem,
} from "@/components/templates/AccountLayout/accountNavConfig"

import { Button } from "../atoms/Button"
import type { FilledIconProps } from "../atoms/icons/FilledIcon"
import {
  CloseIcon,
  DownArrowIcon,
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
} from "../atoms/icons"

type NavbarUserMenuProps = {
  variant: "desktop" | "mobile"
}

export const NAVBAR_SEGMENT_ICONS: Record<
  string,
  ComponentType<Omit<FilledIconProps, "children">>
> = {
  profile: UserManagementUserIcon,
  orders: UserManagementClipboardIcon,
  addresses: UserManagementLocationIcon,
  credit: UserManagementCardIcon,
  notifications: UserManagementBellIcon,
  favorites: UserManagementHeartIcon,
  delete: UserManagementBinIcon,
}

const MOBILE_SEPARATOR_SEGMENTS = new Set(["favorites", "delete"])
const MOBILE_COLORED_SEGMENTS = new Set(["profile"])

const NAVBAR_MENU_ITEMS = getNavItems("showInNavbarMenu")

function getDisplayName(customer: CustomerProfile): string {
  return (
    customer.fullName?.trim() ||
    customer.email?.trim() ||
    customer.phone ||
    ""
  )
}

function getFirstName(displayName: string): string {
  return displayName.split(" ")[0] || displayName
}

function UserAvatar({
  customer,
  size = "xsmall",
}: {
  customer: CustomerProfile
  size?: "xsmall" | "small"
}) {
  const displayName = getDisplayName(customer)
  const sizeClasses =
    size === "xsmall"
      ? "h-sop-28px w-sop-28px text-sm"
      : "h-sop-56px w-sop-56px text-sm"

  return (
    <div
      className={cn(
        "flex aspect-square items-center justify-center rounded-full bg-sop-neutral-gray-500",
        sizeClasses,
      )}
      aria-hidden="true"
    >
      {displayName.charAt(0) ? (
        <span className="sop-body-xs-medium text-sop-primary-500">
          {displayName.charAt(0)}
        </span>
      ) : (
        <ProfileIcon size={{ mobile: 20, desktop: 20 }} />
      )}
    </div>
  )
}

function DesktopDropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className="flex w-full cursor-pointer items-center gap-sop-12px px-sop-16px py-2.5 text-left hover:bg-sop-neutral-gray-500"
      onClick={() => {
        void onClick?.()
      }}
    >
      {icon}
      <p className="sop-body-sm-regular">{label}</p>
    </button>
  )
}

function MobileListItem({
  icon,
  label,
  onClick,
  separator,
  colored,
}: {
  icon: ReactNode
  label: string
  onClick?: () => void
  separator?: boolean
  colored?: boolean
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5",
        colored ? "bg-sop-primary-200" : "bg-transparent",
        separator && "border-b border-sop-neutral-gray-500",
      )}
      onClick={() => {
        void onClick?.()
      }}
    >
      {icon}
      <p className="sop-body-sm-regular">{label}</p>
    </button>
  )
}

function NavbarMenuLink({
  item,
  onNavigate,
  mobile,
}: {
  item: AccountNavItem
  onNavigate: () => void
  mobile?: boolean
}) {
  const router = useRouter()
  const segment = item.segment ?? ""
  const Icon = NAVBAR_SEGMENT_ICONS[segment]
  const prefetchHandlers = createAccountPagePrefetchHandlers(item.href, () =>
    router.prefetch(item.href),
  )

  if (mobile) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5",
          MOBILE_COLORED_SEGMENTS.has(segment) && "bg-sop-primary-200",
          MOBILE_SEPARATOR_SEGMENTS.has(segment) &&
            "border-b border-sop-neutral-gray-500",
        )}
        {...prefetchHandlers}
      >
        {Icon ? (
          <Icon size={{ mobile: 14, desktop: 14 }} color="#454547" />
        ) : null}
        <p className="sop-body-sm-regular">{item.label}</p>
      </Link>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="flex w-full cursor-pointer items-center gap-sop-12px px-sop-16px py-2.5 hover:bg-sop-neutral-gray-500"
      {...prefetchHandlers}
    >
      {Icon ? (
        <Icon size={{ mobile: 14, desktop: 14 }} color="#454547" />
      ) : null}
      <p className="sop-body-sm-regular">{item.label}</p>
    </Link>
  )
}

function NavbarUserMenuDesktop() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    NAVBAR_MENU_ITEMS.forEach((item) => {
      router.prefetch(item.href)
      prefetchAccountPage(item.href)
    })

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, router])

  if (isLoading) {
    return (
      <div className="hidden h-sop-36px w-[76px] animate-pulse rounded-sop-32 bg-sop-neutral-gray-500 md:block" />
    )
  }

  if (!isAuthenticated || !customer) {
    return (
      <Link href="/login" className="hidden md:block">
        <Button className="hidden md:block" size="md" variant="primary">
          เข้าสู่ระบบ
        </Button>
      </Link>
    )
  }

  const displayName = getDisplayName(customer)
  const firstName = getFirstName(displayName)

  return (
    <div ref={menuRef} className="relative hidden md:block">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-sop-8px"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`เมนูผู้ใช้: ${firstName}`}
        onClick={() => setOpen((current) => !current)}
      >
        <UserAvatar customer={customer} />
        <span className="sop-body-md-regular hidden max-w-[120px] truncate text-sop-neutral-gray-300 md:inline-flex">
          {firstName}
        </span>
        <DownArrowIcon size={{ mobile: 16, desktop: 16 }} color="#454547" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[240px] overflow-hidden rounded-sop-8px border border-sop-neutral-gray-500 bg-sop-neutral-gray-600 shadow-lg">
          {NAVBAR_MENU_ITEMS.map((item) => (
            <NavbarMenuLink
              key={item.href}
              item={item}
              onNavigate={() => setOpen(false)}
            />
          ))}
          <DesktopDropdownItem
            icon={<SignOutIcon size={{ mobile: 14, desktop: 14 }} color="#454547" />}
            label="ออกจากระบบ"
            onClick={async () => {
              setOpen(false)
              await logout()
            }}
          />
        </div>
      )}
    </div>
  )
}

function NavbarUserMenuMobile() {
  const { customer, isAuthenticated, isLoading, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  if (isLoading) {
    return (
      <div className="block h-4 w-4 animate-pulse rounded-full bg-sop-neutral-gray-500 md:hidden" />
    )
  }

  const displayName = customer ? getDisplayName(customer) : ""
  const firstName = getFirstName(displayName)

  return (
    <div className="block md:hidden">
      <div className="flex items-center justify-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "ปิดเมนูผู้ใช้" : "เปิดเมนูผู้ใช้"}
          onClick={() => setOpen(true)}
        >
          <MenuNavIcon size={{ mobile: 16, desktop: 16 }} color="#454547" />
        </button>
      </div>

      <div
        role="presentation"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-10 bg-black/20 transition-opacity duration-200 ease-out",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      >
        <section
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="เมนูผู้ใช้"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            "absolute top-0 right-0 z-10 h-full w-[75%] bg-sop-base-white",
            "transition duration-200 ease-out",
            open
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-full opacity-0",
          )}
        >
          <div className="flex h-[92px] items-end justify-end px-[17px] py-[21px]">
            <button
              type="button"
              className="inline-flex aspect-square min-h-[32px] min-w-[32px] items-center justify-center rounded-xl bg-sop-primary-500 p-sop-8px"
              aria-label="ปิดเมนูผู้ใช้"
              onClick={() => setOpen(false)}
            >
              <CloseIcon size={{ mobile: 16, desktop: 16 }} color="#fff" />
            </button>
          </div>

          <div className="flex flex-col">
            {!isAuthenticated || !customer ? (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 bg-sop-primary-200 px-4 py-2.5"
              >
                <SignInIcon size={{ mobile: 14, desktop: 14 }} color="#454547" />
                <p className="sop-body-sm-regular">เข้าสู่ระบบ</p>
              </Link>
            ) : (
              <>
                <div className="mb-5 flex h-sop-56px items-center gap-sop-16px px-4">
                  <UserAvatar customer={customer} size="small" />
                  <span className="sop-body-sm-regular">{firstName}</span>
                </div>
                {NAVBAR_MENU_ITEMS.map((item) => (
                  <NavbarMenuLink
                    key={item.href}
                    item={item}
                    mobile
                    onNavigate={() => setOpen(false)}
                  />
                ))}
                <MobileListItem
                  icon={<SignOutIcon size={{ mobile: 14, desktop: 14 }} color="#454547" />}
                  label="ออกจากระบบ"
                  separator
                  onClick={async () => {
                    setOpen(false)
                    await logout()
                  }}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export function NavbarUserMenu({ variant }: NavbarUserMenuProps) {
  if (variant === "mobile") {
    return <NavbarUserMenuMobile />
  }

  return <NavbarUserMenuDesktop />
}
