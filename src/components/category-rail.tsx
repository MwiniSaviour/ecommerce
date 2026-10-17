"use client";

import {
  ArrowUpRight,
  Dumbbell,
  House,
  Shirt,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import type { CategoryFilter } from "@/lib/products";

const categories: {
  title: string;
  filter: CategoryFilter;
  detail: string;
  icon: typeof Smartphone;
  iconClass: string;
  toneClass: string;
}[] = [
  { title: "Phones & tech", filter: "Tech", detail: "Little life upgrades", icon: Smartphone, iconClass: "text-[#547787]", toneClass: "bg-[#eaf1f2]" },
  { title: "Home & living", filter: "Home", detail: "Make yourself at home", icon: House, iconClass: "text-[#667949]", toneClass: "bg-[#edf0e2]" },
  { title: "Fashion", filter: "Fashion", detail: "Wear what feels good", icon: Shirt, iconClass: "text-[#b66d5e]", toneClass: "bg-[#f7eae5]" },
  { title: "Beauty", filter: "Beauty", detail: "Your little rituals", icon: Sparkles, iconClass: "text-[#98758e]", toneClass: "bg-[#f0eaf2]" },
  { title: "Sports & outdoors", filter: "Sports", detail: "Move at your pace", icon: Dumbbell, iconClass: "text-[#597d72]", toneClass: "bg-[#e7efea]" },
];

export function CategoryRail() {
  const { activeCategory, setActiveCategory, setSavedOnly, setSearchTerm } = useStorefront();

  function pickCategory(category: CategoryFilter) {
    setActiveCategory(activeCategory === category ? "All" : category);
    setSavedOnly(false);
    setSearchTerm("");
    window.setTimeout(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  return (
    <section id="categories" aria-labelledby="categories-heading" className="scroll-mt-40">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="eyebrow mb-2 text-[10px] font-bold uppercase tracking-[0.19em] text-brand">Find your next favourite</p>
          <h2 id="categories-heading" className="font-display text-[26px] leading-tight tracking-[-0.035em] text-ink sm:text-[31px]">Shop by category</h2>
        </div>
        <p className="hidden max-w-[240px] pb-1 text-right text-[12px] leading-relaxed text-muted sm:block">Good things for the everyday, all in one easy place.</p>
      </div>

      <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
        {categories.map(({ title, filter, detail, icon: Icon, iconClass, toneClass }, index) => {
          const selected = activeCategory === filter;
          return (
            <button
              key={`${title}-${index}`}
              type="button"
              onClick={() => pickCategory(filter)}
              aria-pressed={selected}
              className={`category-card group flex min-w-[185px] snap-start items-center gap-3 rounded-[20px] border p-3.5 text-left sm:min-w-0 sm:p-3.5 lg:flex-col lg:items-start lg:gap-3.5 lg:p-4 ${selected ? "border-forest bg-[#edf1e9] ring-1 ring-forest/10" : "border-border/80 bg-paper hover:bg-white"}`}
            >
              <span className={`flex size-[45px] shrink-0 items-center justify-center rounded-[15px] transition group-hover:scale-[1.03] ${toneClass} ${iconClass}`}>
                <Icon aria-hidden="true" size={21} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold leading-tight text-ink">{title}</span>
                <span className="mt-1 block text-[10px] leading-tight text-muted">{detail}</span>
              </span>
              <ArrowUpRight aria-hidden="true" size={15} className="shrink-0 text-muted/65 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand lg:self-end" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
