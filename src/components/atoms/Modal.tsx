"use client"

import { useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import { XIcon } from "./icons/inline/XIcon"

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

type ModalProps = {
  header?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  onClose?: () => void
  overlayClassName?: string
  className?: string
  width?: number
  transparentBackground?: boolean
  insideCloseButton?: boolean
  contentClassName?: string
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">

export const Modal = ({
  header,
  children,
  footer,
  onClose,
  className,
  overlayClassName,
  width = 600,
  transparentBackground = false,
  insideCloseButton = false,
  contentClassName,
  ...dialogProps
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.()
    },
    [onClose]
  )

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab") return

    const focusableElements =
      modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else if (document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }, [])

  useEffect(() => {
    previousActiveElement.current = document.activeElement

    if (onClose) {
      document.addEventListener("keydown", handleEscape)
    }
    document.addEventListener("keydown", handleTabKey)
    document.body.style.overflow = "hidden"

    const focusable = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR)
    if (focusable && focusable.length > 0) {
      ;(focusable[0] as HTMLElement).focus()
    } else {
      modalRef.current?.focus()
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("keydown", handleTabKey)
      document.body.style.overflow = ""

      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [onClose, handleEscape, handleTabKey])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-14">
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-sm",
          transparentBackground
            ? "bg-transparent"
            : "bg-sop-neutral-whitealpha-400",
          overlayClassName
        )}
      />

      <div
        className={cn("relative w-full max-w-150", className)}
        style={{ maxWidth: width }}
      >
        {onClose && !insideCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-14 right-4 translate-x-1/2 z-9999 flex h-10 w-10 items-center justify-center rounded-full bg-sop-base-white shadow-lg text-sop-base-black cursor-pointer"
          >
            <XIcon size={{ mobile: 18 }} color="#454547" />
          </button>
        )}

        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={cn(
            "flex max-h-135.25 flex-col overflow-hidden rounded-sop-20px bg-sop-base-white shadow-lg relative",
            transparentBackground && "bg-transparent shadow-none"
          )}
          {...dialogProps}
        >
          {insideCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-sop-base-white shadow-lg text-sop-base-black cursor-pointer"
            >
              <XIcon size={{ mobile: 16 }} color="#454547" />
            </button>
          )}

          {header != null && <div className="shrink-0 p-4">{header}</div>}

          <div
            className={cn(
              "flex-1 overflow-y-auto px-4",
              contentClassName
            )}
          >
            {children}
          </div>

          {footer != null && (
            <div className="shrink-0 bg-sop-base-white p-4">
              <div className="shrink-0">{footer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
