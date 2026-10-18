"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, LayoutGrid, Search, ShoppingCart, X } from "lucide-react";
import { categories } from "@/lib/categories";
import { useStorefront } from "@/components/storefront-provider";

const tabs = [
  { key: "home", label: "Home", href: "/", icon: Home },
  { key: "categories", label: "Categories", icon: LayoutGrid },
  { key: "search", label: "Search", href: "/search", icon: Search },
  { key: "cart", label: "Cart", href: "/cart", icon: ShoppingCart },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useStorefront();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeydown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-4">
        {tabs.map(({ key, label, href, icon: Icon }) =>
          href ? (
            <li key={key}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${isActive(href) ? "text-brand" : "text-muted"}`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
                <span className="flex items-center gap-0.5">
                  {label}
                  {key === "cart" && cartCount > 0 ? (
                    <span className="flex min-w-3.5 items-center justify-center rounded-full bg-brand px-1 text-[8px] font-bold leading-none text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ) : (
            <li key={key}>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${isActive("/category/") ? "text-brand" : "text-muted"}`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={1.75} />
                {label}
              </button>
            </li>
          ),
        )}
      </ul>
      {isOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setIsOpen(false)} className="absolute inset-0 bg-black/30" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="All categories"
            className="absolute inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] bg-white p-4 pb-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink">All categories</h2>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close menu" className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/category/${category.slug}`} onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-1.5 rounded-lg border border-border p-2.5 text-center text-[11px] font-medium text-ink hover:border-brand/50 hover:text-brand">
                    <category.icon aria-hidden="true" size={20} strokeWidth={1.75} className="text-brand" />
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
