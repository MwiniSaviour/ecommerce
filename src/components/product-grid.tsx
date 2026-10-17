"use client";

import { ArrowRight, Heart, RotateCcw, Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { useStorefront } from "@/components/storefront-provider";
import { products, type CategoryFilter } from "@/lib/products";

const filters: { label: string; value: CategoryFilter }[] = [
  { label: "All finds", value: "All" },
  { label: "Tech", value: "Tech" },
  { label: "Home", value: "Home" },
  { label: "Fashion", value: "Fashion" },
  { label: "Beauty", value: "Beauty" },
  { label: "Sports", value: "Sports" },
];

export function ProductGrid() {
  const {
    searchTerm,
    activeCategory,
    setActiveCategory,
    setSearchTerm,
    wishlistIds,
    savedOnly,
    setSavedOnly,
  } = useStorefront();

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch =
      !normalizedSearch ||
      `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(normalizedSearch);
    const matchesSaved = !savedOnly || wishlistIds.includes(product.id);
    return matchesCategory && matchesSearch && matchesSaved;
  });

  const activeFilterLabel = filters.find((filter) => filter.value === activeCategory)?.label ?? "All finds";

  function resetFilters() {
    setActiveCategory("All");
    setSearchTerm("");
    setSavedOnly(false);
  }

  return (
    <section id="products" aria-labelledby="products-heading" className="scroll-mt-40">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2 text-[10px] font-bold uppercase tracking-[0.19em] text-brand">
            {savedOnly ? "Kept close for later" : normalizedSearch ? "Your search, sorted" : "The good stuff"}
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 id="products-heading" className="font-display text-[27px] leading-tight tracking-[-0.035em] text-ink sm:text-[34px]">
              {savedOnly ? "Your saved finds." : normalizedSearch ? `Finds for “${searchTerm}”.` : "A few things you'll love."}
            </h2>
            {savedOnly && <Heart aria-hidden="true" size={19} className="fill-brand text-brand" />}
          </div>
          <p className="mt-2 text-[12px] text-muted sm:text-[13px]">
            {savedOnly
              ? "Your little shortlist, all in one place."
              : normalizedSearch
                ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "thoughtful find" : "thoughtful finds"} to explore.`
                : "Thoughtfully picked, fairly priced, ready for real life."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActiveCategory("All");
            setSearchTerm("");
            setSavedOnly(false);
          }}
          className="hidden items-center gap-2 text-xs font-bold text-forest transition hover:text-brand sm:flex"
        >
          See all finds <ArrowRight aria-hidden="true" size={15} />
        </button>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <div role="group" aria-label="Filter products by category" className="hide-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => {
            const selected = activeCategory === filter.value && !savedOnly;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setActiveCategory(filter.value);
                  setSearchTerm("");
                  setSavedOnly(false);
                }}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-semibold transition sm:px-4 sm:text-xs ${selected ? "border-forest bg-forest text-white" : "border-border bg-paper text-muted hover:border-forest/30 hover:text-ink"}`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <span className="hidden shrink-0 text-[11px] text-muted lg:block" aria-live="polite">
          {visibleProducts.length} finds · {savedOnly ? "saved" : activeCategory === "All" ? "all categories" : activeFilterLabel}
        </span>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="flex min-h-[270px] flex-col items-center justify-center rounded-[26px] border border-dashed border-forest/20 bg-[#f1f3ec] px-5 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-forest shadow-sm">
            {savedOnly && wishlistIds.length === 0 ? <Heart aria-hidden="true" size={21} /> : <Search aria-hidden="true" size={21} />}
          </span>
          <h3 className="mt-4 font-display text-[25px] tracking-[-0.03em] text-ink">
            {savedOnly && wishlistIds.length === 0 ? "Nothing saved just yet." : "No finds for that one. Yet."}
          </h3>
          <p className="mt-2 max-w-[350px] text-sm leading-relaxed text-muted">
            {savedOnly && wishlistIds.length === 0
              ? "Tap the heart on anything that catches your eye and it’ll be waiting right here."
              : "Try a different search or clear your filters to see everything in the edit."}
          </p>
          <button type="button" onClick={resetFilters} className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-xs font-bold text-white transition hover:bg-forest-light">
            <RotateCcw aria-hidden="true" size={14} />
            Show all finds
          </button>
        </div>
      )}
    </section>
  );
}
