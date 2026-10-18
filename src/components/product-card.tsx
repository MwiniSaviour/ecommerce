"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useStorefront } from "@/components/storefront-provider";

const badgeToneClass = {
  coral: "bg-[#f8e8e2] text-[#a54f38]",
  green: "bg-leaf text-brand-deep",
  dark: "bg-forest text-white",
} as const;

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, wishlistIds, toggleWishlist, showToast } = useStorefront();
  const saved = wishlistIds.includes(product.id);
  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  function toggleSaved() {
    toggleWishlist(product.id);
    showToast(saved ? "Removed from your saved finds" : "Saved for later — good choice");
  }

  return (
    <article className="product-card relative flex min-w-0 flex-col overflow-hidden rounded-sm border border-border/70 bg-paper">
      <div className="relative aspect-square overflow-hidden bg-sand">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 23vw"
            className="object-cover"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute left-1.5 top-1.5 rounded-sm bg-[#e61601] px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}
        <button
          type="button"
          onClick={toggleSaved}
          aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
          aria-pressed={saved}
          className={`absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-105 ${saved ? "text-brand" : "text-ink/75 hover:text-brand"}`}
        >
          <Heart aria-hidden="true" size={15} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-2">
        {product.badges.map((badge) => (
          <span key={badge} className={`mb-1 w-fit rounded-sm px-1.5 py-0.5 text-[9px] font-bold ${badgeToneClass.coral}`}>
            {badge}
          </span>
        ))}
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.4em] text-[12px] font-medium leading-[1.35] text-ink hover:text-brand"
        >
          {product.name}
        </Link>

        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[14px] font-bold tracking-[-0.02em] text-ink">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-[10px] text-muted line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>

        {product.rating > 0 && (
          <span className="mt-1 flex items-center gap-1 text-[10px] text-muted">
            <Star aria-hidden="true" size={11} fill="currentColor" className="text-[#f0a04a]" />
            {product.rating.toFixed(1)}
          </span>
        )}

        {(product.seller?.officialStore || product.delivery?.express) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {product.seller?.officialStore && (
              <span className="rounded-sm bg-leaf px-1.5 py-0.5 text-[9px] font-semibold text-brand-deep">Official Store</span>
            )}
            {product.delivery?.express && (
              <span className="rounded-sm bg-sand px-1.5 py-0.5 text-[9px] font-semibold text-ink">Express</span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          className="mt-auto flex min-h-9 w-full items-center justify-center gap-1.5 rounded-sm bg-brand px-3 text-[12px] font-bold text-white transition hover:bg-brand-deep focus-visible:outline-offset-2"
        >
          <ShoppingCart aria-hidden="true" size={14} strokeWidth={1.9} />
          Add to cart
        </button>
      </div>
    </article>
  );
}
