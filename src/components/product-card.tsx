"use client";

import Image from "next/image";
import {
  Check,
  Heart,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useStorefront } from "@/components/storefront-provider";

const badgeToneClass = {
  coral: "bg-[#f8e8e2] text-[#a54f38]",
  green: "bg-[#e8efdc] text-[#4e694a]",
  dark: "bg-forest text-white",
} as const;

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, wishlistIds, toggleWishlist, showToast } = useStorefront();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const saved = wishlistIds.includes(product.id);

  function toggleSaved() {
    toggleWishlist(product.id);
    showToast(saved ? "Removed from your saved finds" : "Saved for later — good choice");
  }

  return (
    <>
      <article className="product-card group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-border/80 bg-paper p-2.5 sm:rounded-[24px] sm:p-3">
        <div className="product-image relative aspect-[1.14/1] overflow-hidden rounded-[17px] bg-[#f1f0eb] sm:rounded-[19px]">
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            aria-label={`Quick view ${product.name}`}
            className="absolute inset-0 z-[1]"
          >
            <Image
              src={product.image}
              alt={product.alt}
              fill
              sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 23vw"
              className="object-cover"
            />
          </button>
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/[0.025] to-transparent" />
          {product.badge && (
            <span className={`absolute left-2.5 top-2.5 z-[3] max-w-[calc(100%-3.8rem)] truncate rounded-full px-2.5 py-1.5 text-[8px] font-extrabold tracking-[0.1em] sm:left-3 sm:top-3 sm:text-[9px] ${badgeToneClass[product.badgeTone ?? "coral"]}`}>
              {product.badge}
            </span>
          )}
          <button
            type="button"
            onClick={toggleSaved}
            aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
            aria-pressed={saved}
            className={`absolute right-2.5 top-2.5 z-[4] flex size-8 items-center justify-center rounded-full border border-black/[0.04] bg-white/90 shadow-sm backdrop-blur-sm transition hover:scale-105 sm:right-3 sm:top-3 sm:size-9 ${saved ? "text-brand" : "text-ink/75 hover:text-brand"}`}
          >
            <Heart aria-hidden="true" size={17} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="absolute bottom-2.5 right-2.5 z-[3] hidden rounded-full bg-white/90 px-3 py-2 text-[10px] font-semibold text-ink opacity-0 shadow-sm backdrop-blur-sm transition group-hover:opacity-100 md:block"
          >
            Quick view
          </button>
        </div>

        <div className="flex flex-1 flex-col px-1 pt-3 sm:px-1.5 sm:pt-3.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-muted sm:text-[10px]">{product.brand}</p>
          <button
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="mt-1.5 min-h-[36px] text-left text-[12px] font-semibold leading-[1.4] text-ink transition hover:text-brand sm:min-h-[42px] sm:text-[13px]"
          >
            {product.name}
          </button>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[10px] font-bold text-ink sm:text-[11px]">
              <Star aria-hidden="true" size={12} fill="currentColor" className="text-[#d99c45]" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted">({product.reviewCount})</span>
            <span className="ml-auto rounded-full bg-[#f2f4ec] px-2 py-1 text-[8px] font-semibold text-forest sm:text-[9px]">
              {product.category}
            </span>
          </div>
          <div className="mt-2.5 flex min-h-[22px] flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[14px] font-extrabold tracking-[-0.03em] text-ink sm:text-[16px]">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-[10px] text-muted line-through sm:text-[11px]">{formatPrice(product.compareAt)}</span>}
          </div>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-forest/15 bg-white px-3 text-[11px] font-bold text-forest transition hover:border-forest hover:bg-forest hover:text-white focus-visible:outline-offset-2 sm:min-h-[42px] sm:text-xs"
          >
            <ShoppingBag aria-hidden="true" size={15} strokeWidth={1.9} />
            Add to bag
          </button>
        </div>
      </article>
      {quickViewOpen && <ProductQuickView product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
}

function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addToCart, wishlistIds, toggleWishlist, showToast } = useStorefront();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const saved = wishlistIds.includes(product.id);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="drawer-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`quick-view-${product.id}`}
        className="drawer-panel relative grid max-h-[92vh] w-full max-w-[780px] grid-cols-1 overflow-y-auto rounded-t-[28px] bg-paper shadow-2xl sm:grid-cols-2 sm:overflow-hidden sm:rounded-[28px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[265px] bg-[#f1f0eb] sm:min-h-[460px]">
          <Image src={product.image} alt={product.alt} fill sizes="(max-width: 640px) 100vw, 390px" className="object-cover" />
          {product.badge && <span className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-[9px] font-extrabold tracking-[0.12em] ${badgeToneClass[product.badgeTone ?? "coral"]}`}>{product.badge}</span>}
        </div>
        <div className="relative flex flex-col p-6 sm:p-8">
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close product details" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-cream text-muted transition hover:bg-sand hover:text-ink sm:right-5 sm:top-5">
            <X aria-hidden="true" size={17} />
          </button>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.17em] text-brand">{product.brand}</p>
          <h2 id={`quick-view-${product.id}`} className="mt-3 max-w-[290px] font-display text-[30px] leading-[1.08] tracking-[-0.035em] text-ink sm:text-[34px]">{product.name}</h2>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            <span className="flex items-center gap-1 font-bold text-ink"><Star aria-hidden="true" size={13} fill="currentColor" className="text-[#d99c45]" />{product.rating.toFixed(1)}</span>
            <span>·</span>
            <span>{product.reviewCount} thoughtful reviews</span>
          </div>
          <div className="mt-5 flex flex-wrap items-baseline gap-2">
            <span className="text-[22px] font-extrabold tracking-[-0.04em] text-ink">{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-sm text-muted line-through">{formatPrice(product.compareAt)}</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">A well-loved pick, chosen for the little things that make everyday life feel easier. Product details and availability are sample content for this storefront preview.</p>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#f2f4ec] p-3.5 text-xs leading-relaxed text-forest">
            <Check aria-hidden="true" size={17} className="shrink-0" />
            <span>Easy delivery options across Ghana. Your delivery estimate appears at checkout.</span>
          </div>
          <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-6">
            <button type="button" onClick={() => { addToCart(product.id); onClose(); }} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition hover:bg-brand-deep">
              <ShoppingBag aria-hidden="true" size={17} /> Add to bag
            </button>
            <button
              type="button"
              aria-label={saved ? "Remove from saved items" : "Save for later"}
              aria-pressed={saved}
              onClick={() => { toggleWishlist(product.id); showToast(saved ? "Removed from your saved finds" : "Saved for later — good choice"); }}
              className={`flex size-12 items-center justify-center rounded-full border border-border transition hover:border-brand/30 hover:bg-[#f8e8e2] ${saved ? "text-brand" : "text-ink"}`}
            >
              <Heart aria-hidden="true" size={19} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
