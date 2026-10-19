"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { helpGroup, aboutGroup, partnerGroup } from "@/lib/navigation";

const payments = ["Mobile Money", "Visa", "Mastercard"];

// Buyer footer; seller and driver portals ship their own shells.
export function SiteFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/seller") || pathname.startsWith("/driver")) {
    return null;
  }

  return (
    <footer className="bg-forest text-white/80">
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-8 sm:px-6 sm:pt-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="text-lg font-bold text-brand">
              Kora<span className="text-brand-deep">Market</span>
            </p>
            <p className="mt-2 max-w-xs text-[12px] leading-relaxed">
              Everyday finds for home, work and everywhere in between. Delivered across Ghana.
            </p>
            <ul className="mt-4 flex gap-2">
              {payments.map((payment) => (
                <li key={payment} className="rounded border border-white/20 px-2 py-1 text-[10px] font-medium text-white/70">
                  {payment}
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Need help">
            <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-white">Need help?</h2>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/account/orders" className="hover:text-white">Track an order</Link>
              </li>
              {helpGroup.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About Kora Market">
            <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-white">About</h2>
            <ul className="space-y-2 text-[12px]">
              {aboutGroup.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Make money with Kora Market">
            <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-white">Money with Kora</h2>
            <ul className="space-y-2 text-[12px]">
              {partnerGroup.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-white/10 pt-4 text-[11px] text-white/50">© 2026 Kora Market.</p>
      </div>
    </footer>
  );
}
