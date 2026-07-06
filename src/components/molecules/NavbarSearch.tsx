"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"

import { SearchIcon } from "../atoms/icons"

const SEARCH_LABEL = "ค้นหาสินค้า"
const SEARCH_PARAM = "q"

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      submitSearch(query)
      return
    }

    if (event.key === "Escape") {
      setQuery("")
      inputRef.current?.blur()
    }
  }

  const searchInputId = useMemo(() => "navbar-search-input", [])

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex min-w-0 flex-1 items-center"
    >
      <label htmlFor={searchInputId} className="sr-only">
        {SEARCH_LABEL}
      </label>
      <div
        className={cn(
          "sop-body-sm-regular flex h-9 w-full min-w-[200px] max-w-[480px] items-center gap-2 rounded-full",
          "bg-sop-neutral-gray-500 px-3 md:px-4",
          "focus-within:ring-2 focus-within:ring-sop-primary-400 focus-within:ring-offset-1",
        )}
      >
        <SearchIcon
          size={{ mobile: 16, desktop: 18 }}
          color="#454547"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          id={searchInputId}
          name={SEARCH_PARAM}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={SEARCH_LABEL}
          autoComplete="off"
          enterKeyHint="search"
          aria-label={SEARCH_LABEL}
          className={cn(
            "sop-body-sm-regular min-w-0 flex-1 appearance-none border-0 bg-transparent outline-none",
            "px-1 py-1",
            "text-sop-neutral-gray-100 placeholder:text-sop-neutral-gray-400",
          )}
        />
      </div>
      <button type="submit" className="sr-only">
        ค้นหา
      </button>
    </form>
  )
}
