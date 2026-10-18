"use client";

/* DESIGN DIRECTION: not Jumia-verified — assumed */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { Bike, Home, Trophy, UserRound } from "lucide-react";
import { DRIVER_PROFILE_KEY, parseDriverProfile } from "@/lib/driver-tasks";
import { readStorageRaw, subscribeStorageKey } from "@/lib/local-store";

const TABS = [
  { href: "/driver/home", label: "Home", icon: Home },
  { href: "/driver/tasks", label: "Tasks", icon: Bike },
  { href: "/driver/earnings", label: "Earnings", icon: Trophy },
  { href: "/driver/account", label: "Account", icon: UserRound },
];

type DriverProfileRaw = ReturnType<typeof parseDriverProfile>;

function useDriverProfileWatch(): DriverProfileRaw {
  const raw = useSyncExternalStore(
    (callback) => subscribeStorageKey(DRIVER_PROFILE_KEY, callback),
    () => readStorageRaw(DRIVER_PROFILE_KEY),
    () => null,
  );
  return parseDriverProfile(raw);
}

export function DriverShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const profile = useDriverProfileWatch();
  const isApplyRoute = pathname === "/driver";
  const approved = profile?.status === "approved";
  const gated = !approved && !isApplyRoute;

  return (
    <div className="flex min-h-dvh justify-center bg-cream md:py-8">
      <div className="flex w-full flex-col bg-cream md:max-w-[390px] md:overflow-hidden md:rounded-[14px] md:border md:border-border md:shadow-[0_12px_40px_rgba(47,47,49,0.12)]">
        <header className="flex items-center justify-between border-b border-border bg-paper px-4 py-3">
          <Link href={approved ? "/driver/home" : "/driver"} className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-[4px] bg-brand text-white" aria-hidden="true">
              <Bike size={16} strokeWidth={2} />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.02em] text-ink">Kora Fleet</span>
          </Link>
          {approved && (
            <span className="rounded-[99px] bg-ok-soft px-2.5 py-1 text-[11px] font-bold text-ok">Verified rider</span>
          )}
        </header>
        {gated ? (
          <main className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[15px] font-bold text-ink">Finish your application first</p>
            <p className="max-w-xs text-[13px] text-muted">
              We verify every Kora Fleet rider before their first delivery. Submit your details and come back once approved.
            </p>
            <Link
              href="/driver"
              className="inline-flex min-h-12 items-center rounded-[4px] bg-brand px-5 text-[13px] font-bold text-white transition hover:bg-brand-deep"
            >
              Open application
            </Link>
          </main>
        ) : (
          <div className="flex-1">{children}</div>
        )}
        {approved && (
          <nav aria-label="Driver app" className="flex border-t border-border bg-paper pb-[env(safe-area-inset-bottom)]">
            {TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                    active ? "text-brand" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
