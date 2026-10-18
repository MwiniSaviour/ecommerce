"use client";

import Image from "next/image";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { DeliveryMethod, PaymentMethod } from "@/components/checkout-view";
import type { Product } from "@/lib/products";

const paymentLabels: Record<PaymentMethod, { label: string; icon: typeof CreditCard }> = {
  pod: { label: "Pay on delivery", icon: Banknote },
  momo: { label: "Mobile money", icon: Smartphone },
  card: { label: "Card", icon: CreditCard },
};

export function CheckoutOrderSummary({
  lines,
  subtotal,
  shipmentFee,
  deliveryMethod,
  paymentMethod,
}: {
  lines: { product: Product; quantity: number }[];
  subtotal: number;
  shipmentFee: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
}) {
  const total = subtotal + shipmentFee;
  const payment = paymentLabels[paymentMethod];

  return (
    <section
      aria-labelledby="checkout-summary-heading"
      className="rounded-sm border border-border bg-paper p-4"
    >
      <h2 id="checkout-summary-heading" className="text-base font-bold text-ink">
        Order summary
      </h2>
      <ul className="mt-3 space-y-3">
        {lines.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-3">
            <Image
              src={product.image}
              alt={product.name}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-sm bg-sand object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink">{product.name}</p>
              <p className="text-[11px] text-muted">
                {quantity} × {formatPrice(product.price)}
              </p>
            </div>
            <span className="text-xs font-bold text-ink">{formatPrice(product.price * quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-semibold text-ink">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted">{deliveryMethod === "delivery" ? "Shipment fee" : "Pickup"}</dt>
          <dd className="font-semibold text-ink">{formatPrice(shipmentFee)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <dt className="text-muted">Total</dt>
          <dd className="text-lg font-bold text-ink">{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 flex items-center gap-2 text-[11px] text-muted">
        <payment.icon size={14} aria-hidden="true" className="text-brand-deep" />
        Paying with {payment.label}
      </p>
    </section>
  );
}
