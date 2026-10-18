"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export type CatalogSort = "featured" | "price-asc" | "price-desc" | "rating";

export type CatalogSortOption = {
  value: CatalogSort;
  label: string;
};

export const catalogSortOptions: CatalogSortOption[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
];

export type CatalogListingProps = {
  items: Product[];
  activeCategory?: string;
  sort?: CatalogSort;
};

function byLowestPrice(first: Product, second: Product): number {
  return first.price - second.price;
}

function byHighestPrice(first: Product, second: Product): number {
  return second.price - first.price;
}

function byBestRating(first: Product, second: Product): number {
  return second.rating - first.rating;
}

export function sortCatalogItems(items: Product[], sort: CatalogSort): Product[] {
  const ordered = [...items];
  switch (sort) {
    case "price-asc":
      return ordered.sort(byLowestPrice);
    case "price-desc":
      return ordered.sort(byHighestPrice);
    case "rating":
      return ordered.sort(byBestRating);
    default:
      return ordered;
  }
}

export function CatalogListing({ items, activeCategory, sort = "featured" }: CatalogListingProps) {
  const [sortValue, setSortValue] = useState<CatalogSort>(sort);
  const sortedItems = useMemo(() => sortCatalogItems(items, sortValue), [items, sortValue]);

  function handleSortChosen(value: string) {
    setSortValue(value as CatalogSort);
  }

  function handleSortSelected(event: ChangeEvent<HTMLSelectElement>) {
    handleSortChosen(event.target.value);
  }

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-muted" aria-live="polite">
          {items.length} item{items.length === 1 ? "" : "s"} found
        </p>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-[12px] text-muted">Sort by:</span>
          <div role="group" aria-label="Sort products" className="flex gap-1.5">
            {catalogSortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSortChosen(option.value)}
                aria-pressed={sortValue === option.value}
                data-active-category={activeCategory}
                className={`min-h-9 rounded-full border px-3.5 text-[12px] font-medium transition ${
                  sortValue === option.value
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-paper text-ink hover:border-brand hover:text-brand"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative sm:hidden">
          <label htmlFor="catalog-sort-select" className="sr-only">
            Sort products
          </label>
          <select
            id="catalog-sort-select"
            value={sortValue}
            onChange={handleSortSelected}
            className="w-full appearance-none rounded-[4px] border border-border bg-white py-2 pl-3 pr-9 text-[12px] font-medium text-ink"
          >
            {catalogSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} strokeWidth={1.75} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {sortedItems.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}
