"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Boxes,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Menu,
  PackageOpen,
  RotateCcw,
  Settings,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import { clearSellerSession, useSellerSession } from "@/lib/seller-auth";
import { readStorageRaw } from "@/lib/local-store";
import { SELLER_AUTH_KEY } from "@/lib/seller-auth";
import { useSellerOrders } from "@/lib/seller-orders";

const NAV_ITEMS = [
  { href: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/seller/orders", label: "Orders", icon: PackageOpen },
  { href: "/seller/products", label: "Products", icon: Boxes },
  { href: "/seller/finances", label: "Finances", icon: Wallet },
  { href: "/seller/performance", label: "Performance", icon: TrendingUp },
  { href: "/seller/returns", label: "Returns & Claims", icon: RotateCcw },
  { href: "/seller/settings", label: "Settings", icon: Settings },
  { href: "/seller/support", label: "Support", icon: LifeBuoy },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/seller/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navTestId(label: string): string {
  return `seller-nav-${label.toLowerCase().replace(/[^a-z]+/g, "-")}`;
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = useSellerSession();
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useStorefront();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const orders = useSellerOrders();
  const actionCount = orders.filter(
    (order) => order.status === "pending" || order.status === "ready-to-ship",
  ).length;

  const isSignIn = pathname === "/seller/sign-in";

  useEffect(() => {
    // During hydration the store serves the server snapshot (null), so a
    // client-side session can appear a tick after the first commit. Redirect
    // only when the actual storage confirms there is no session.
    if (session || isSignIn) return;
    if (readStorageRaw(SELLER_AUTH_KEY) !== null) return;
    router.replace("/seller/sign-in");
  }, [session, isSignIn, router]);

  if (isSignIn) {
    return <>{children}</>;
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream px-4">
        <div className="w-full max-w-sm rounded-[14px] bg-paper p-8 text-center shadow-sm">
          <Lock className="mx-auto size-8 text-brand" aria-hidden="true" />
          <h1 className="mt-3 text-[16px] font-bold text-ink">Sign in required</h1>
          <p className="mt-2 text-[13px] text-muted">
            This area of Kora Market is for signed-in sellers only.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/seller/sign-in")}
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white transition-colors hover:bg-brand-deep"
            data-testid="seller-guard-sign-in"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href));

  const handleSignOut = () => {
    setAvatarOpen(false);
    clearSellerSession();
    showToast("Signed out");
    router.replace("/seller/sign-in");
  };

  return (
    <div className="flex min-h-dvh bg-cream" data-testid="seller-shell">
      <aside className="print:hidden hidden w-16 shrink-0 flex-col bg-paper md:flex lg:w-[234px]">
        <div className="px-3 py-5">
          <Link href="/seller/dashboard" className="flex items-center gap-2 px-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[14px] bg-brand text-[13px] font-bold text-white">
              K
            </span>
            <span className="hidden text-[14px] font-bold leading-tight text-ink lg:block">
              Kora
              <br />
              Vendor Hub
            </span>
          </Link>
        </div>
        <nav className="flex-1 px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                data-testid={navTestId(item.label)}
                className={`relative flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-[13px] font-medium transition-colors ${
                  active ? "bg-leaf text-brand" : "text-muted hover:bg-sand hover:text-ink"
                }`}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-brand"
                    aria-hidden="true"
                  />
                )}
                <item.icon size={18} aria-hidden="true" />
                <span className="hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="print:hidden sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-border bg-paper px-4 md:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-10 items-center justify-center rounded-full text-ink hover:bg-sand md:hidden"
            aria-label="Open menu"
            data-testid="seller-menu-open"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">
            {activeItem?.label ?? "Seller portal"}
          </h1>
          <button
            type="button"
            onClick={() => router.push("/seller/orders")}
            className="relative flex size-10 items-center justify-center rounded-full text-ink hover:bg-sand"
            aria-label="Open orders"
            data-testid="seller-bell"
          >
            <Bell size={20} aria-hidden="true" />
            {actionCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e61601] px-1 text-[10px] font-bold text-white">
                {actionCount}
              </span>
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setAvatarOpen((open) => !open)}
              className="flex size-9 items-center justify-center rounded-full bg-leaf text-[13px] font-bold text-brand"
              aria-label="Account menu"
              data-testid="seller-avatar"
            >
              {session.name.charAt(0).toUpperCase()}
            </button>
            {avatarOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setAvatarOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-[14px] border border-border bg-paper p-2 shadow-md">
                  <p className="px-3 py-2 text-[13px] font-bold text-ink">{session.name}</p>
                  <p className="px-3 pb-2 text-[12px] text-muted">{session.business}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex min-h-10 w-full items-center gap-2 rounded-[14px] px-3 text-[13px] font-medium text-[#e61601] hover:bg-sand"
                    data-testid="seller-sign-out"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
      {menuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40 bg-ink/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-paper p-4 pb-6 shadow-md">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[14px] font-bold text-ink">Kora Vendor Hub</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-9 items-center justify-center rounded-full hover:bg-sand"
                aria-label="Close menu"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav className="grid gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  data-testid={navTestId(item.label)}
                  className={`flex min-h-11 items-center gap-3 rounded-[14px] px-3 text-[13px] font-medium ${
                    isActive(pathname, item.href)
                      ? "bg-leaf text-brand"
                      : "text-ink hover:bg-sand"
                  }`}
                >
                  <item.icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
