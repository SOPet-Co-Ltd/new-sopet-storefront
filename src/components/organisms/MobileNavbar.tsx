"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import { CloseIcon, HamburgerMenuIcon } from "../atoms/icons"

type MobileNavCategory = {
  id: string
  label: string
  href: string
}

type MobileNavbarProps = {
  parentCategories?: MobileNavCategory[]
  childrenCategories?: MobileNavCategory[]
}

export function MobileNavbar({
  parentCategories = [],
  childrenCategories = [],
}: MobileNavbarProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeMenuHandler = () => {
    setOpenMenu(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!openMenu) return

    menuRef.current?.focus()

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenuHandler()
      }
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return

      const focusableElements = menuRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("keydown", handleTabKey)

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("keydown", handleTabKey)
    }
  }, [openMenu])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpenMenu(true)}
        aria-label="เปิดเมนู"
        aria-expanded={openMenu}
        aria-controls="mobile-menu"
      >
        <HamburgerMenuIcon aria-hidden="true" />
      </button>
      {openMenu && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="เมนูหลัก"
          tabIndex={-1}
          className="fixed left-0 top-0 z-20 h-full w-full bg-primary p-2"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeMenuHandler}
              aria-label="ปิดเมนู"
              className="p-2"
            >
              <CloseIcon size={{ mobile: 20, desktop: 20 }} aria-hidden="true" />
            </button>
          </div>
          <nav
            aria-label="หมวดหมู่สินค้า"
            className={cn("mt-4 rounded-xs border", {
              "pt-2": childrenCategories.length > 0,
            })}
          >
            {parentCategories.length > 0 && (
              <ul className="flex flex-col">
                {parentCategories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={category.href}
                      className="block px-4 py-3 sop-body-sm-regular text-sop-base-white hover:bg-white/10"
                      onClick={closeMenuHandler}
                    >
                      {category.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {childrenCategories.length > 0 && (
              <ul className="flex flex-col border-t pt-2">
                {childrenCategories.map((category) => (
                  <li key={category.id}>
                    <a
                      href={category.href}
                      className="block px-4 py-3 sop-body-sm-regular text-sop-base-white hover:bg-white/10"
                      onClick={closeMenuHandler}
                    >
                      {category.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      )}
    </div>
  )
}
