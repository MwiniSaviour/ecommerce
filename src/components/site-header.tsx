"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HelpCircle, LayoutGrid, ShoppingCart, X } from "lucide-react";
import { categories } from "@/lib/categories";
import { useStorefront } from "@/components/storefront-provider";

const quickLinks = [
  { label: "Help", href: "/help/contact" },
  { label: "Track an order", href: "/account/orders" },
  { label: "Saved items", href: "/account/saved" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { cartCount } = useStorefront();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [menuOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header>
      <div className="bg-[#B177DA] px-4 py-1 text-center text-[11px] font-medium text-white">
        <Link href="/help/contact" className="underline-offset-2 hover:underline">
          Grow your business — sell on Kora Market
        </Link>
      </div>
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-3 py-2.5 sm:gap-6 sm:px-4">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open shopping cart categories menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-sand md:hidden"
          >
            <LayoutGrid aria-hidden="true" size={20} strokeWidth={1.75} />
          </button>
          <Link href="/" aria-label="Kora Market home" className="shrink-0 leading-none">
            <span className="text-lg font-bold tracking-tight text-brand sm:text-xl">
              Kora<span className="text-brand-deep">Market</span>
            </span>
          </Link>
          <form action="/search" method="get" className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-border bg-sand">
            <input
              type="search"
              name="q"
              required
              autoComplete="off"
              placeholder="Search products, brands and categories"
              aria-label="Search"
              className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-[13px] text-ink outline-none placeholder:text-muted"
            />
            <button type="submit" className="bg-brand px-3 text-[13px] font-medium text-white hover:bg-brand-deep sm:px-4">
              Search
            </button>
          </form>
          <nav aria-label="Account and cart" className="hidden items-center gap-5 text-[12px] font-medium text-ink sm:flex">
            <Link href="/help/contact" className="flex items-center gap-1.5 hover:text-brand">
              <HelpCircle aria-hidden="true" size={18} strokeWidth={1.75} />
              Help
            </Link>
            <Link href="/cart" aria-label={`Open shopping cart, ${cartCount} items`} className="flex items-center gap-1.5 hover:text-brand">
              <span className="relative">
                <ShoppingCart aria-hidden="true" size={18} strokeWidth={1.75} />
                <span aria-hidden="true" className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              </span>
              Cart
            </Link>
          </nav>
          <Link href="/cart" aria-label="Open shopping cart" className="relative flex size-9 items-center justify-center rounded-md text-ink hover:bg-sand sm:hidden">
            <ShoppingCart aria-hidden="true" size={20} strokeWidth={1.75} />
            <span aria-hidden="true" className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
      <div className="hidden border-b border-border bg-white md:block">
        <ul className="mx-auto flex max-w-[1440px] items-center gap-5 overflow-x-auto px-4 text-[12px] font-medium text-ink">
          {categories.map((category) => (
            <li key={category.slug} className="shrink-0">
              <Link
                href={`/category/${category.slug}`}
                aria-current={isActive(`/category/${category.slug}`) ? "page" : undefined}
                className={`py-2 hover:text-brand ${isActive(`/category/${category.slug}`) ? "border-b-2 border-brand text-brand" : "border-b-2 border-transparent"}`}
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {menuOpen ? (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <span className="text-[13px] font-bold text-ink">Menu</span>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-sand hover:text-ink">
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <nav aria-label="Mobile menu" className="overflow-y-auto p-4">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">Categories</h2>
            <ul className="mb-4 divide-y divide-border">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center gap-2.5 text-[14px] text-ink hover:text-brand">
                    <category.icon aria-hidden="true" size={18} strokeWidth={1.75} className="text-brand" />
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted">More</h2>
            <ul className="mb-4 divide-y divide-border">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center text-[14px] text-ink hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/deals" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center text-[14px] font-medium text-ink hover:text-brand">
                  Flash Sales
                </Link>
              </li>
              <li>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center text-[14px] text-ink hover:text-brand">
                  My account
                </Link>
              </li>
            </ul>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center justify-between rounded-md bg-leaf px-3 py-2 text-[14px] font-medium text-ink"
            >
              Cart
              <span className="flex items-center gap-1.5 text-[12px] text-muted">
                {cartCount} item{cartCount === 1 ? "" : "s"}
                <ShoppingCart aria-hidden="true" size={16} strokeWidth={1.75} />
              </span>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
