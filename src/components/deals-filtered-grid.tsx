"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CategoryFilter, Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

const dealCategories: { value: CategoryFilter; label: string }[] = [
  { value: "All", label: "All deals" },
  { value: "Tech", label: "Tech" },
  { value: "Home", label: "Home" },
  { value: "Fashion", label: "Fashion" },
  { value: "Beauty", label: "Beauty" },
  { value: "Sports", label: "Sports" },
];

export function DealsFilteredGrid({ deals }: { deals: Product[] }) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("All");

  const visible = useMemo(
    () => (activeFilter === "All" ? deals : deals.filter((product) => product.category === activeFilter)),
    [deals, activeFilter],
  );

  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 sm:px-6" aria-labelledby="deals-grid-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="deals-grid-heading" className="text-[16px] font-bold text-ink">All discounted picks</h2>
        <nav aria-label="Filter deals by category" className="flex flex-wrap gap-1.5">
          {dealCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => setActiveFilter(category.value)}
              aria-pressed={activeFilter === category.value}
              className={`rounded-[4px] border px-3 py-1.5 text-[12px] font-medium transition ${
                activeFilter === category.value
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-paper text-ink hover:border-brand"
              }`}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-[2px] border border-border bg-paper px-4 py-8 text-center text-[13px] text-muted">
          No finance-friendly deals in {activeFilter === "All" ? "any" : activeFilter} category right now — keep an eye on
          this page and head back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-[12px] text-muted">
        Looking for something else?{" "}
        <Link href="/" className="font-medium text-brand hover:underline">
          Browse all products
        </Link>
      </p>
    </section>
  );
}
