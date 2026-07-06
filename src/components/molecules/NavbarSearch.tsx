"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { MagnifyingGlassIcon } from "../atoms/icons"

const SEARCH_LABEL = "ค้นหาสินค้า"
const SEARCH_PARAM = "query"

export function NavbarSearch() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")

  const submitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return

      router.push(`/search?${SEARCH_PARAM}=${encodeURIComponent(trimmed)}`)
    },
    [router],
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitSearch(query)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = event.relatedTarget as Node | null
    if (relatedTarget && event.currentTarget.form?.contains(relatedTarget)) {
      return
    }

    submitSearch(query)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return

    setQuery("")
    inputRef.current?.blur()
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative min-w-0 flex-1"
    >
      <label htmlFor="navbar-search-input" className="sr-only">
        {SEARCH_LABEL}
      </label>
      <div
        className={cn(
          "sop-body-sm-regular flex items-center gap-1 rounded-full bg-sop-neutral-gray-500",
          "px-3 py-1.5 md:gap-2 md:px-4",
          "focus-within:ring-2 focus-within:ring-sop-primary-400 focus-within:ring-offset-1",
        )}
      >
        <MagnifyingGlassIcon
          size={{ mobile: 16, desktop: 18 }}
          color="#454547"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          id="navbar-search-input"
          name={SEARCH_PARAM}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={SEARCH_LABEL}
          autoComplete="off"
          enterKeyHint="search"
          className={cn(
            "sop-body-sm-regular min-w-0 flex-1 appearance-none border-0 bg-transparent outline-none",
            "px-1 py-1 md:py-2",
            "text-sop-neutral-gray-100 placeholder:text-sop-neutral-gray-400",
          )}
        />
      </div>
    </form>
  )
}
