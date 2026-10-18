"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { PackageCheck, CircleDot } from "lucide-react";
import { getProductById } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { readStorageRaw, subscribeStorageKey } from "@/lib/local-store";

type StoredOrderItem = { id?: unknown; quantity?: unknown };

type StoredOrder = {
  id?: unknown;
  placedAt?: unknown;
  total?: unknown;
  items?: unknown;
};

type OrderLine = { uid: string; name: string; slug: string; quantity: number; price: number };

type Order = {
  id: string;
  placedAt: number;
  total: number;
  lines: OrderLine[];
  delivered: boolean;
};

function asPositiveNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function sanitizeOrder(entry: unknown): Order | null {
  if (typeof entry !== "object" || entry === null) return null;
  const order = entry as StoredOrder;
  const id = typeof order.id === "string" && order.id.length > 0 ? order.id : null;
  const placedAt = asPositiveNumber(order.placedAt);
  const total = asPositiveNumber(order.total);
  if (id === null || placedAt === null || total === null) return null;
  const lines: OrderLine[] = [];
  if (Array.isArray(order.items)) {
    for (const rawItem of order.items) {
      const item = rawItem as StoredOrderItem;
      const productId = typeof item.id === "string" ? item.id : null;
      const quantity = asPositiveNumber(item.quantity);
      if (productId === null || quantity === null) continue;
      const product = getProductById(productId);
      if (!product) continue;
      lines.push({ uid: productId, quantity, name: product.name, slug: product.slug, price: product.price });
    }
  }
  return { id, placedAt, total, lines, delivered: Date.now() - placedAt > 7 * 24 * 60 * 60 * 1000 };
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function parseOrders(raw: string | null): Order[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const list = parsed.map(sanitizeOrder).filter((order): order is Order => order !== null);
    list.sort((a, b) => b.placedAt - a.placedAt);
    return list;
  } catch {
    return [];
  }
}

export default function OrdersPage() {
  const raw = useSyncExternalStore(
    (callback) => subscribeStorageKey("kora-market-orders-v1", callback),
    () => readStorageRaw("kora-market-orders-v1"),
    () => null,
  );
  const orders = useMemo(() => parseOrders(raw), [raw]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-[12px] text-muted">
        <ol className="flex items-center gap-1.5">
          <li><Link href="/" className="hover:text-brand">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/account" className="hover:text-brand">Account</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">My orders</li>
        </ol>
      </nav>
      <header>
        <h1 className="text-[22px] font-bold tracking-[-0.02em] text-ink">My orders</h1>
        <p className="mt-1 text-[13px] text-muted">Every checkout you confirmed in this browser, newest first.</p>
      </header>

      <section className="mt-6">
        {orders.length === 0 ? (
          <div className="rounded-[2px] border border-border bg-paper px-4 py-10 text-center" data-testid="orders-empty">
            <PackageCheck aria-hidden="true" size={28} strokeWidth={1.6} className="mx-auto text-brand" />
            <p className="mt-3 text-[14px] font-bold text-ink">No orders yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">
              Nothing here so far. The next time a checkout completes, its receipt will land in this list with live delivery status.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-10 items-center rounded-[4px] bg-brand px-5 text-[13px] font-bold text-white transition hover:bg-brand-deep"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id} className="rounded-[2px] border border-border bg-paper p-4" data-testid="order-row">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-bold text-ink">Order {order.id}</p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      Placed {new Date(order.placedAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}
                      {order.lines.length > 0 ? pluralize(order.lines.length, "item") : "Items no longer shown"}
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-ink">{formatPrice(order.total)}</p>
                </div>
                {order.lines.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-border pt-3 text-[12px] text-ink">
                    {order.lines.map((line) => (
                      <li key={line.uid} className="flex justify-between gap-3">
                        <span>
                          {pluralize(line.quantity, "×")}{" "}
                          <Link href={`/product/${line.slug}`} className="hover:text-brand hover:underline">
                            {line.name}
                          </Link>
                        </span>
                        <span className="shrink-0 text-muted">{formatPrice(line.price * line.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 flex items-center gap-1.5 text-[12px] font-bold" data-testid="order-status">
                  {order.delivered ? (
                    <>
                      <span className="inline-block size-2 rounded-full bg-forest" aria-hidden="true" />
                      Delivered
                    </>
                  ) : (
                    <>
                      <CircleDot aria-hidden="true" size={14} strokeWidth={2} className="text-brand" />
                      On the way — processing
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
