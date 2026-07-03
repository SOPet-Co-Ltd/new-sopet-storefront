import type { ReactNode } from "react"

export type HeaderProps = {
  className?: string
  children?: ReactNode
}

export function Header({ className, children }: HeaderProps) {
  return (
    <header
      aria-label="Site header"
      className={["w-full", className].filter(Boolean).join(" ")}
    >
      {children}
    </header>
  )
}
