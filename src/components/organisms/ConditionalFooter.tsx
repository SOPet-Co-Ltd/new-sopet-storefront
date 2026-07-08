"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/organisms/Footer";

const HIDDEN_FOOTER_PATHS = ["/cart"];

export function ConditionalFooter() {
  const pathname = usePathname();

  if (HIDDEN_FOOTER_PATHS.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
