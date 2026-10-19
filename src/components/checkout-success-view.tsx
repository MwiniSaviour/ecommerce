"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Package, Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ordersApi } from "@/lib/api";

type StoredOrder = {
  id: string;
  placedAt: string;
  deliveryMethod: "delivery" | "pickup";
  paymentMethod: "pod" | "momo" | "card";
  subtotal: number;
  shipmentFee: number;
  total: number;
  items: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
};

const paymentLabels: Record<StoredOrder["paymentMethod"], string> = {
  pod: "Pay on delivery",
  momo: "Mobile money",
  card: "Card",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function CheckoutSuccessView() {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const read = async () => {
      try {
        const list = await ordersApi.getCustomerOrders();
        if (!cancelled && list.length > 0) {
          setOrder(list[0] as StoredOrder);
        }
      } catch {
        if (!cancelled) setOrder(null);
      }
      if (!cancelled) setLoaded(true);
    };
    void read();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-sm border border-border bg-paper p-8 text-center">
          <p className="text-[13px] text-muted">Loading your confirmation…</p>
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-sm border border-border bg-paper p-8 text-center">
          <h1 className="text-lg font-bold text-ink">No recent order</h1>
          <p className="mt-1 text-[13px] text-muted">Place an order to see its confirmation here.</p>
          <a
            href="/"
            className="mt-4 inline-flex min-h-12 items-center rounded-sm bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep"
          >
            Start shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <section className="rounded-sm border border-border bg-paper p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-brand-deep">
          <CheckCircle2 size={28} aria-hidden="true" />
        </div>
        <h1 className="mt-3 text-lg font-bold text-ink">Order confirmed</h1>
        <p className="mt-1 text-[13px] text-muted">
          Order <span className="font-semibold text-ink">{order.id}</span> placed on {formatDate(order.placedAt)}.
        </p>
      </section>

      <section aria-label="Order details" className="mt-4 rounded-sm border border-border bg-paper p-4">
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <Image
                src={item.image}
                alt={item.name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-sm bg-sand object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                <p className="text-[11px] text-muted">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-xs font-bold text-ink">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold text-ink">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">{order.deliveryMethod === "delivery" ? "Shipment fee" : "Pickup"}</dt>
            <dd className="font-semibold text-ink">{formatPrice(order.shipmentFee)}</dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <dt className="text-muted">Total</dt>
            <dd className="text-lg font-bold text-ink">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="Delivery details" className="mt-4 rounded-sm border border-border bg-paper p-4">
        <div className="flex items-start gap-3">
          {order.deliveryMethod === "delivery" ? (
            <Truck size={20} aria-hidden="true" className="mt-0.5 text-brand-deep" />
          ) : (
            <Package size={20} aria-hidden="true" className="mt-0.5 text-brand-deep" />
          )}
          <div>
            <p className="text-sm font-semibold text-ink">
              {order.deliveryMethod === "delivery" ? "Home delivery" : "Pickup station"}
            </p>
            <p className="text-[13px] text-muted">
              {order.deliveryMethod === "delivery"
                ? "Estimated 2–4 business days — you will get a call on the day of delivery."
                : "Ready for pickup within 2 business days — bring your ID and this order number."}
            </p>
            <p className="mt-1 text-[13px] text-muted">Paying with {paymentLabels[order.paymentMethod]}.</p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <a
          href="/"
          className="flex min-h-12 items-center justify-center rounded-sm bg-brand px-5 text-sm font-bold text-white hover:bg-brand-deep"
        >
          Continue shopping
        </a>
        <a
          href="/account/orders"
          className="flex min-h-12 items-center justify-center rounded-sm border border-border bg-paper px-5 text-sm font-bold text-ink hover:border-brand hover:text-brand-deep"
        >
          Track order
        </a>
      </div>
    </div>
  );
}
