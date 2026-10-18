"use client";

import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteHeader } from "@/components/site-header";

// Renders the buyer chrome everywhere except seller and driver portals, which
// ship their own dedicated shells.
export function StorefrontChrome() {
  const pathname = usePathname();

  if (pathname.startsWith("/seller") || pathname.startsWith("/driver")) {
    return null;
  }

  return (
    <>
      <SiteHeader />
      <MobileBottomNav />
    </>
  );
}
