"use client";

import Link from "next/link";
import { MapPin, Package, Save, ScrollText, Store, Truck } from "lucide-react";
import { SignInPanel, useAccountSession, setSession } from "@/components/account-auth-panel";

const quickLinks = [
  { href: "/account/orders", label: "My orders", description: "Track what has landed and what is on the way", icon: Package },
  { href: "/account/saved", label: "Saved items", description: "Everything you marked as a maybe", icon: Save },
  { href: "/account/addresses", label: "Delivery address", description: "Where we bring your parcels", icon: MapPin },
  { href: "/help/contact", label: "Help & contact", description: "Talk to a human when a parcel looks late", icon: ScrollText },
];

export default function AccountPage() {
  const session = useAccountSession();

  const partnerLinks = [
    { href: "/seller", label: "Sell on Kora", description: "Open a shop in the Kora Vendor Hub", icon: Store },
    { href: "/driver/apply", label: "Drive with Kora", description: "Deliver orders and earn with the fleet", icon: Truck },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6">
      <header>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[26px]">Account</h1>
        <p className="mt-1 text-[13px] text-muted">
          {session
            ? "Welcome back — everything you order, save or track lives here."
            : "Sign in or create an account to track orders, keep saved picks and manage where parcels land."}
        </p>
      </header>

      <section className="mt-6">
        {session ? (
          <section>
            <div className="mx-auto max-w-sm rounded-[2px] border border-border bg-paper p-5">
              <p className="text-[12px] font-medium text-muted">Signed in as</p>
              <p className="mt-0.5 text-[14px] font-bold text-ink">{session.email}</p>
              <button
                type="button"
                onClick={() => {
                  setSession(null);
                }}
                className="mt-4 min-h-10 w-full rounded-[4px] border border-border bg-transparent px-4 text-[13px] font-bold text-ink transition hover:border-brand hover:text-brand"
              >
                Sign out
              </button>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2" data-testid="account-links">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex h-full items-start gap-3 rounded-[2px] border border-border bg-paper p-4 transition hover:border-brand"
                  >
                    <link.icon aria-hidden="true" size={18} strokeWidth={1.9} className="mt-0.5 shrink-0 text-brand" />
                    <span>
                      <span className="block text-[13px] font-bold text-ink">{link.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{link.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <SignInPanel />
        )}
      </section>

      <section aria-labelledby="partners-title" className="mt-6">
        <h2 id="partners-title" className="mb-2.5 text-[14px] font-bold text-ink">
          Make money with Kora Market
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2" data-testid="partner-links">
          {partnerLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex h-full items-start gap-3 rounded-[2px] border border-border bg-paper p-4 transition hover:border-brand"
              >
                <link.icon aria-hidden="true" size={18} strokeWidth={1.9} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  <span className="block text-[13px] font-bold text-ink">{link.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{link.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
