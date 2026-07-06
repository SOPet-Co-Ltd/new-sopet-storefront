import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "./Button"

describe("Button", () => {
  it("renders primary variant with legacy size classes", () => {
    render(<Button variant="primary" size="md">Submit</Button>)

    const button = screen.getByRole("button", { name: "Submit" })
    expect(button).toHaveClass("bg-sop-primary-500")
    expect(button).toHaveClass("h-[36px]")
  })

  it("maps legacy default variant to primary", () => {
    render(<Button variant="default">Legacy</Button>)

    expect(screen.getByRole("button", { name: "Legacy" })).toHaveClass(
      "bg-sop-primary-500"
    )
  })

  it("sets aria-busy and disables when loading", () => {
    render(<Button loading>Loading</Button>)

    const button = screen.getByRole("button", { name: "Loading" })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toBeDisabled()
  })

  it("applies full width when fill is true", () => {
    render(<Button fill>Full</Button>)

    expect(screen.getByRole("button", { name: "Full" })).toHaveClass("w-full")
  })
})
