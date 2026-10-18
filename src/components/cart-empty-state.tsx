"use client";

import Link from "next/link";
import { House, Heart, Shirt, ShoppingBag, Smartphone, type LucideIcon } from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import type { CategoryFilter } from "@/lib/products";

type CategoryTile = {
  label: string;
  value: Extract<CategoryFilter, "Tech" | "Home" | "Fashion" | "Beauty">;
  icon: LucideIcon;
};

const tiles: CategoryTile[] = [
  { label: "Phones & Tech", value: "Tech", icon: Smartphone },
  { label: "Home & Office", value: "Home", icon: House },
  { label: "Fashion", value: "Fashion", icon: Shirt },
  { label: "Health & Beauty", value: "Beauty", icon: Heart },
];

export function CartEmptyState() {
  const { setActiveCategory } = useStorefront();

  return (
    <section className="rounded-sm border border-border bg-paper p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand text-muted">
        <ShoppingBag size={24} aria-hidden="true" />
      </div>
      <h2 className="mt-3 text-base font-bold text-ink">Your cart is empty</h2>
      <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted">
        Nothing here yet. Browse the shop and your picks will show up in this cart.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-12 items-center rounded-sm bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep"
      >
        Start shopping
      </Link>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon }) => (
          <Link
            key={value}
            href="/"
            onClick={() => setActiveCategory(value)}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-sm border border-border bg-paper p-3 text-center hover:border-brand hover:bg-leaf"
          >
            <Icon size={20} aria-hidden="true" className="text-forest-light" />
            <span className="text-xs font-semibold text-ink">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
