"use client";

// DESIGN DIRECTION: Aries & Co. Phones order workspace — inspired by Jumia
// seller hub's order detail with shipping label and invoice print views; not
// Jumia-verified. Printing uses Tailwind print: variants — the shell chrome
// and page meta hide, leaving the label or invoice preview on the sheet.

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FileText, PackageOpen, Printer, Truck, XCircle } from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import { getSellerProductById } from "@/lib/seller-products";
import {
  orderCreatedLabel,
  priceOrder,
  sellerStatusClasses,
  sellerStatusLabel,
  updateSellerOrders,
  useSellerOrders,
} from "@/lib/seller-orders";

const METHOD_LABELS: Record<string, string> = {
  dropoff: "Dropoff at Kora station",
  "pickup station": "Pickup station",
  door: "Door delivery",
};

export function OrderView() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { showToast } = useStorefront();
  const orders = useSellerOrders();
  const [printTab, setPrintTab] = useState<"label" | "invoice">("label");

  const order = orders.find((entry) => entry.id === id);

  if (!order) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[14px] bg-paper px-6 py-12 text-center shadow-sm">
        <span className="flex size-10 items-center justify-center rounded-full bg-sand">
          <PackageOpen size={20} className="text-forest-light" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-[14px] font-bold text-ink">Order not found</h2>
        <p className="mt-1 max-w-sm text-[13px] text-muted">
          This order is no longer in your queue. It may have been removed from your records.
        </p>
        <button
          type="button"
          onClick={() => router.push("/seller/orders")}
          className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-[14px] font-bold text-white transition-colors hover:bg-brand-deep"
        >
          Back to orders
        </button>
      </div>
    );
  }

  const pricing = priceOrder(order.items);
  const canMarkReady = order.status === "pending";
  const canCancel = order.status === "pending" || order.status === "ready-to-ship";

  const markReady = () => {
    updateSellerOrders((current) =>
      current.map((entry) =>
        entry.id === order.id
          ? {
              ...entry,
              status: "ready-to-ship",
              history: [
                ...entry.history,
                { at: new Date().toISOString(), label: "Marked ready to ship" },
              ],
            }
          : entry,
      ),
    );
    showToast("Order marked ready to ship");
  };

  const cancelOrder = () => {
    updateSellerOrders((current) =>
      current.map((entry) =>
        entry.id === order.id
          ? {
              ...entry,
              status: "cancelled",
              history: [
                ...entry.history,
                { at: new Date().toISOString(), label: "Cancelled by seller" },
              ],
            }
          : entry,
      ),
    );
    showToast("Order cancelled");
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-4" data-testid="seller-order-detail">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/seller/orders"
          className="flex size-10 items-center justify-center rounded-full bg-paper text-ink hover:bg-sand"
          aria-label="Back to orders"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <h2 className="font-mono text-[16px] font-bold text-ink">{order.id}</h2>
          <p className="text-[12px] text-muted">Placed {orderCreatedLabel(order.created)}</p>
        </div>
        <span
          className={`ml-auto inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${sellerStatusClasses(order.status)}`}
        >
          {sellerStatusLabel(order.status)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={markReady}
          disabled={!canMarkReady}
          className="flex min-h-11 items-center justify-center rounded-full bg-brand px-4 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="seller-order-ready"
        >
          <PackageOpen size={16} className="mr-2" aria-hidden="true" />
          Ready to Ship
        </button>
        <button
          type="button"
          onClick={cancelOrder}
          disabled={!canCancel}
          className="flex min-h-11 items-center justify-center rounded-full border border-hold/40 px-4 text-[13px] font-bold text-hold hover:bg-hold-soft disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="seller-order-cancel"
        >
          <XCircle size={16} className="mr-2" aria-hidden="true" />
          Cancel order
        </button>
      </div>

      <div className="grid gap-4 print:hidden lg:grid-cols-2">
        <section className="rounded-[14px] bg-paper p-5 shadow-sm">
          <h3 className="text-[14px] font-bold text-ink">Items</h3>
          <ul className="mt-3 grid gap-2">
            {order.items.map((item) => {
              const product = getSellerProductById(item.id);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-2 text-[13px] last:border-b-0"
                >
                  <span className="text-ink">
                    {product?.name ?? item.id}
                    <span className="text-muted"> ×{item.qty}</span>
                  </span>
                  <span className="font-bold text-ink">
                    {formatPrice((product?.price ?? 0) * item.qty)}
                  </span>
                </li>
              );
            })}
          </ul>
          <dl className="mt-4 grid gap-1 text-[13px]">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd>{formatPrice(pricing.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Shipment</dt>
              <dd>{formatPrice(pricing.shipment)}</dd>
            </div>
            <div className="flex justify-between font-bold text-ink">
              <dt>Order total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Commission (25%)</dt>
              <dd>-{formatPrice(pricing.commission)}</dd>
            </div>
            <div className="flex justify-between font-bold text-ink">
              <dt>Expected payout</dt>
              <dd>{formatPrice(pricing.subtotal + pricing.shipment - pricing.commission)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[14px] bg-paper p-5 shadow-sm">
          <h3 className="text-[14px] font-bold text-ink">Delivery</h3>
          <dl className="mt-3 grid gap-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Customer</dt>
              <dd className="font-medium text-ink">{order.customer}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">City</dt>
              <dd className="font-medium text-ink">{order.city}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Method</dt>
              <dd className="font-medium text-ink">{METHOD_LABELS[order.method] ?? order.method}</dd>
            </div>
          </dl>
          <h3 className="mt-6 text-[14px] font-bold text-ink">History</h3>
          <ol className="mt-3 grid gap-3 border-l border-border pl-4">
            {order.history.map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="relative text-[13px]">
                <span
                  className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-brand"
                  aria-hidden="true"
                />
                <p className="font-medium text-ink">{entry.label}</p>
                <p className="text-[12px] text-muted">{orderCreatedLabel(entry.at)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setPrintTab("label")}
            className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-colors ${
              printTab === "label" ? "bg-brand text-white" : "bg-cream text-ink hover:bg-sand"
            }`}
            data-testid="seller-print-tab-label"
          >
            <Truck size={16} aria-hidden="true" />
            Shipping Label
          </button>
          <button
            type="button"
            onClick={() => setPrintTab("invoice")}
            className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition-colors ${
              printTab === "invoice" ? "bg-brand text-white" : "bg-cream text-ink hover:bg-sand"
            }`}
            data-testid="seller-print-tab-invoice"
          >
            <FileText size={16} aria-hidden="true" />
            Invoice
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="ml-auto flex min-h-11 items-center justify-center rounded-full bg-brand px-4 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep"
            data-testid="seller-print-button"
          >
            <Printer size={16} className="mr-2" aria-hidden="true" />
            Print
          </button>
        </div>

        {printTab === "label" ? (
          <div className="print:block mx-auto mt-4 w-full max-w-sm rounded-[14px] border border-dashed border-brand/60 bg-cream p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-deep">
              Shipping Label
            </p>
            <p className="mt-2 font-mono text-[13px] font-bold text-ink">Order ID {order.id}</p>
            <p className="mt-4 text-[14px] font-bold text-ink">{order.customer}</p>
            <p className="text-[13px] text-muted">{order.city}, Ghana</p>
            <p className="mt-2 text-[12px] text-muted">
              {METHOD_LABELS[order.method] ?? order.method} — Aries &amp; Co. Phones
            </p>
            <div
              className="mt-4 h-10 w-full bg-[repeating-linear-gradient(90deg,#1c1c1e_0_2px,transparent_2px_5px)]"
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="print:block mx-auto mt-4 w-full max-w-sm rounded-[14px] border border-dashed border-brand/60 bg-cream p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-deep">
              Invoice
            </p>
            <p className="mt-2 font-mono text-[13px] font-bold text-ink">Order ID {order.id}</p>
            <p className="mt-1 text-[13px] text-ink">Aries &amp; Co. Phones — Accra, Ghana</p>
            <p className="text-[12px] text-muted">Billed to {order.customer} ({order.city})</p>
            <ul className="mt-4 grid gap-1 text-[13px]">
              {order.items.map((item) => {
                const product = getSellerProductById(item.id);
                return (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span className="text-ink">
                      {product?.name ?? item.id} ×{item.qty}
                    </span>
                    <span className="font-medium text-ink">
                      {formatPrice((product?.price ?? 0) * item.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-4 grid gap-1 border-t border-border pt-3 text-[13px]">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd>{formatPrice(pricing.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipment</dt>
                <dd>{formatPrice(pricing.shipment)}</dd>
              </div>
              <div className="flex justify-between font-bold text-ink">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}
