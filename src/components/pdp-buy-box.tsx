"use client";

import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { useStorefront } from "@/components/storefront-provider";

export function PdpBuyBox({ product }: { product: Product }) {
  const { addToCart, wishlistIds, toggleWishlist, showToast } = useStorefront();
  const [quantity, setQuantity] = useState(1);
  const saved = wishlistIds.includes(product.id);
  const outOfStock = product.stock <= 0;
  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  function toggleSaved() {
    toggleWishlist(product.id);
    showToast(saved ? "Removed from your saved finds" : "Saved for later — good choice");
  }

  function updateQuantity(next: number) {
    setQuantity(Math.min(Math.max(next, 1), product.stock));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link
          href={`/search?q=${encodeURIComponent(product.brand)}`}
          className="text-[12px] font-medium uppercase tracking-wide text-brand hover:underline"
        >
          {product.brand}
        </Link>
        <h1 className="mt-1 text-[18px] font-bold leading-tight text-ink sm:text-[21px]">{product.name}</h1>
        {product.rating > 0 && (
          <span className="mt-1.5 flex items-center gap-1 text-[12px] text-muted">
            <Star aria-hidden="true" size={13} fill="currentColor" className="text-[#f0a04a]" />
            {product.rating.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[25px]">
          {formatPrice(product.price)}
        </span>
        {product.compareAt && (
          <>
            <span className="text-[13px] text-muted line-through">{formatPrice(product.compareAt)}</span>
            {discount > 0 && (
              <span className="rounded-sm bg-[#e61601] px-1.5 py-0.5 text-[11px] font-bold text-white">
                -{discount}%
              </span>
            )}
          </>
        )}
      </div>

      {outOfStock ? (
        <p className="text-[13px] font-medium text-[#e61601]">Out of stock</p>
      ) : product.stock <= 10 ? (
        <p className="text-[13px] font-medium text-[#a54f38]">Only {product.stock} left</p>
      ) : (
        <p className="text-[13px] text-muted">In stock</p>
      )}

      {product.seller && (
        <p className="flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
          Sold by
          <span className="font-medium text-ink">{product.seller.name}</span>
          {product.seller.officialStore && (
            <span className="rounded-sm bg-leaf px-1.5 py-0.5 text-[10px] font-semibold text-brand-deep">Official Store</span>
          )}
        </p>
      )}
      {product.delivery?.express && (
        <span className="w-fit rounded-sm bg-sand px-1.5 py-0.5 text-[10px] font-semibold text-ink">Express</span>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label="Quantity">
          <div className="flex h-10 w-fit items-center rounded-[4px] border border-border bg-white">
            <button
              type="button"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-full w-10 items-center justify-center text-ink transition hover:text-brand disabled:cursor-not-allowed disabled:text-muted/50"
            >
              <Minus aria-hidden="true" size={15} strokeWidth={1.9} />
            </button>
            <span aria-live="polite" className="w-8 text-center text-[13px] font-semibold text-ink">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={quantity >= product.stock}
              aria-label="Increase quantity"
              className="flex h-full w-10 items-center justify-center text-ink transition hover:text-brand disabled:cursor-not-allowed disabled:text-muted/50"
            >
              <Plus aria-hidden="true" size={15} strokeWidth={1.9} />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => addToCart(product.id, quantity)}
          disabled={outOfStock}
          className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-[4px] bg-brand px-4 text-[13px] font-bold text-white transition hover:bg-brand-deep focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-sand disabled:text-muted"
        >
          <ShoppingCart aria-hidden="true" size={15} strokeWidth={1.9} />
          Add to cart
        </button>
        <button
          type="button"
          onClick={toggleSaved}
          aria-label={saved ? `Remove ${product.name} from saved items` : `Save ${product.name}`}
          aria-pressed={saved}
          className={`flex size-10 shrink-0 items-center justify-center rounded-[4px] border transition ${
            saved ? "border-brand bg-leaf text-brand" : "border-border bg-white text-ink/75 hover:border-brand hover:text-brand"
          }`}
        >
          <Heart aria-hidden="true" size={16} strokeWidth={1.8} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-muted">
        Home delivery across Ghana. Delivery fees depend on your location.
      </p>
    </div>
  );
}
