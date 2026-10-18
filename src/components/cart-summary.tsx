"use client";

import { useState } from "react";
import { shipmentFeeForItems, EXPRESS_SHIPMENT_FEE } from "@/components/cart-fees";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";

export function CartSummary() {
  const { cartItems, cartSubtotal } = useStorefront();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const shipmentFee = shipmentFeeForItems(cartItems);
  const discount = promoApplied ? Math.round(cartSubtotal * 0.1) : 0;
  const total = cartSubtotal - discount + shipmentFee;

  return (
    <section
      aria-labelledby="cart-summary-heading"
      className="rounded-sm border border-border bg-paper p-4"
    >
      <h2 id="cart-summary-heading" className="text-base font-bold text-ink">
        Cart summary
      </h2>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="font-semibold text-ink">{formatPrice(cartSubtotal)}</span>
        </div>
        {promoApplied ? (
          <div className="flex items-center justify-between">
            <span className="text-muted">Promo discount (10%)</span>
            <span className="font-semibold text-[#e61601]">-{formatPrice(discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <span className="text-muted">
            {shipmentFee === EXPRESS_SHIPMENT_FEE ? "Shipment fee (express)" : "Shipment fee (standard)"}
          </span>
          <span className="font-semibold text-ink">{formatPrice(shipmentFee)}</span>
        </div>
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setPromoApplied(promoCode.trim().length > 0);
        }}
      >
        <label className="sr-only" htmlFor="promo-code">
          Promo code
        </label>
        <input
          id="promo-code"
          className="h-10 min-w-0 flex-1 rounded-sm border border-border bg-white px-3 text-sm text-ink           placeholder:text-muted focus:border-brand focus:outline-none"
          placeholder="Promo code"
          value={promoCode}
          onChange={(event) => setPromoCode(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-sm border border-border px-3 text-xs font-bold uppercase tracking-wide text-forest-light hover:bg-sand"
        >
          Apply
        </button>
      </form>
      <p className="mt-2 text-[11px] text-muted">
        Promo codes are demo-only — any code takes 10% off the subtotal.
      </p>
      <dl className="mt-4 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Total</dt>
          <dd className="text-lg font-bold text-ink">{formatPrice(total)}</dd>
        </div>
      </dl>
      <a
        href="/checkout"
        className="mt-4 flex min-h-12 items-center justify-center rounded-sm bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep"
      >
        Proceed to checkout
      </a>
    </section>
  );
}
