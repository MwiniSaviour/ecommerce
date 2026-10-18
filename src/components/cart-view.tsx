"use client";

import { ChevronRight, ShoppingBag } from "lucide-react";
import { CartEmptyState } from "@/components/cart-empty-state";
import { CartLineItem } from "@/components/cart-line-item";
import { CartSummary } from "@/components/cart-summary";
import { useStorefront } from "@/components/storefront-provider";
import { getProductById } from "@/lib/products";

export function CartView() {
  const { cartItems, cartCount, removeFromCart } = useStorefront();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-muted">
        <a href="/" className="hover:text-brand-deep">
          Home
        </a>
        <ChevronRight size={12} aria-hidden="true" />
        <span aria-current="page" className="font-semibold text-ink">
          Cart
        </span>
      </nav>

      {cartItems.length === 0 ? (
        <div className="mt-4">
          <CartEmptyState />
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
              <ShoppingBag size={20} aria-hidden="true" className="text-brand-deep" />
              Cart
              <span className="text-sm font-normal text-muted">
                {cartCount} item{cartCount === 1 ? "" : "s"}
              </span>
            </h1>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wide text-muted hover:text-[#e61601]"
              onClick={() => {
                for (const item of cartItems) removeFromCart(item.id);
              }}
            >
              Clear cart
            </button>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            <section aria-label="Cart items" className="rounded-sm border border-border bg-paper p-4">
              {cartItems.map((item) => {
                const product = getProductById(item.id);
                if (!product) return null;
                return <CartLineItem key={item.id} product={product} quantity={item.quantity} />;
              })}
            </section>
            <div className="space-y-4">
              <CartSummary />
              <a
                href="/"
                className="flex min-h-12 items-center justify-center rounded-sm border border-border bg-paper text-sm font-bold text-ink hover:border-brand hover:text-brand-deep"
              >
                Continue shopping
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
