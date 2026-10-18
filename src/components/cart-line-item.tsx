"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/products";

export function CartLineItem({ product, quantity }: { product: Product; quantity: number }) {
  const { updateCartItem, removeFromCart } = useStorefront();

  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-b-0 last:pb-0">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          width={96}
          height={96}
          className="h-24 w-24 object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-deep"
        >
          {product.name}
        </Link>
        {product.seller ? (
          <p className="text-[11px] text-muted">
            Sold by{" "}
            <span className="text-forest-light">
              {product.seller.officialStore ? "Official store" : product.seller.name}
            </span>
          </p>
        ) : null}
        {product.delivery?.express ? (
          <p className="text-[11px] font-semibold text-brand-deep">Express delivery available</p>
        ) : null}
        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center border border-border">
            <button
              type="button"
              aria-label={`Decrease quantity of ${product.name}`}
              className="flex h-8 w-8 items-center justify-center text-forest-light disabled:opacity-40"
              disabled={quantity <= 1}
              onClick={() => updateCartItem(product.id, quantity - 1)}
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span
              aria-live="polite"
              className="w-8 text-center text-xs font-semibold text-ink"
            >
              {quantity}
            </span>
            <button
              type="button"
              aria-label={`Increase quantity of ${product.name}`}
              className="flex h-8 w-8 items-center justify-center text-forest-light disabled:opacity-40"
              disabled={quantity >= product.stock}
              onClick={() => updateCartItem(product.id, quantity + 1)}
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-[11px] text-muted hover:text-[#e61601]"
            onClick={() => removeFromCart(product.id)}
          >
            <Trash2 size={12} aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center">
        <span className="text-[11px] text-muted">Each</span>
        <span className="text-xs font-bold text-ink">{formatPrice(product.price)}</span>
        <span className="mt-2 text-sm font-bold text-ink">{formatPrice(product.price * quantity)}</span>
      </div>
    </div>
  );
}
