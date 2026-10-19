"use client";

// DESIGN DIRECTION: Aries & Co. Phones dashboard — inspired by Jumia seller
// hub's KPI strip, action items and Seller Score panel; not Jumia-verified.
// Seller Score figures are hardcoded demo values pending real analytics (A2).

import Link from "next/link";
import { ArrowRight, Clock, PackageOpen } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { getSellerProductById } from "@/lib/seller-products";
import {
  orderCreatedLabel,
  sellerNowMs,
  sellerStatusClasses,
  sellerStatusLabel,
  useSellerOrders,
} from "@/lib/seller-orders";

const SCORE_DIMENSIONS = [
  { label: "On-time shipping quality", value: 4.6 },
  { label: "Product ratings", value: 4.3 },
  { label: "Return rate", value: 4.8 },
  { label: "Cancellation rate", value: 4.1 },
];

const DAY_MS = 86_400_000;

export default function SellerDashboardPage() {
  const orders = useSellerOrders();
  const now = sellerNowMs();

  const pending = orders.filter((order) => order.status === "pending");
  const ready = orders.filter((order) => order.status === "ready-to-ship");
  const open = orders.filter(
    (order) => order.status === "pending" || order.status === "ready-to-ship",
  );
  const gmv30 = orders
    .filter(
      (order) =>
        order.status !== "cancelled" && now - new Date(order.created).getTime() < 30 * DAY_MS,
    )
    .reduce((sum, order) => sum + order.total, 0);
  const cancelled = orders.filter((order) => order.status === "cancelled").length;
  const cancellationRate = orders.length > 0 ? Math.round((cancelled / orders.length) * 100) : 0;
  const stalePending = pending.filter((order) => now - new Date(order.created).getTime() > DAY_MS);
  const recent = [...orders]
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
    .slice(0, 6);
  const scoreAvg = (
    SCORE_DIMENSIONS.reduce((sum, dim) => sum + dim.value, 0) / SCORE_DIMENSIONS.length
  ).toFixed(1);

  const itemsSummary = (items: { id: string; qty: number }[]): string =>
    items
      .map((item) => `${getSellerProductById(item.id)?.name ?? item.id} ×${item.qty}`)
      .join(", ");

  const kpis = [
    { label: "Open orders", value: String(open.length), testid: "seller-kpi-open" },
    { label: "Pending orders", value: String(pending.length), testid: "seller-kpi-pending" },
    { label: "30-day GMV", value: formatPrice(gmv30), testid: "seller-kpi-gmv" },
    {
      label: "Cancellation rate",
      value: `${cancellationRate}%`,
      testid: "seller-kpi-cancellation",
    },
  ];

  return (
    <div className="mx-auto grid max-w-5xl gap-6" data-testid="seller-dashboard">
      <div>
        <h2 className="text-[18px] font-bold text-ink">Dashboard</h2>
        <p className="mt-1 text-[13px] text-muted">
          Aries &amp; Co. Phones — seller since 2024. Here is how your storefront is doing today.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[14px] bg-paper p-4 shadow-sm">
            <p className="text-[12px] font-medium text-muted">{kpi.label}</p>
            <p className="mt-1 text-[22px] font-bold text-ink" data-testid={kpi.testid}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-[14px] bg-paper p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h3 className="text-[14px] font-bold text-ink">Seller Score</h3>
            <p className="text-[20px] font-bold text-brand" data-testid="seller-score-avg">
              {scoreAvg}
              <span className="text-[12px] font-medium text-muted"> / 5</span>
            </p>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Four metrics, weighted equally at 25% each.
          </p>
          <ul className="mt-4 grid gap-3">
            {SCORE_DIMENSIONS.map((dim) => (
              <li key={dim.label}>
                <div className="flex items-center justify-between text-[13px] text-ink">
                  <span>{dim.label}</span>
                  <span className="font-bold">{dim.value.toFixed(1)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-sand">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${(dim.value / 5) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[14px] bg-paper p-5 shadow-sm">
          <h3 className="text-[14px] font-bold text-ink">Action items</h3>
          <ul className="mt-4 grid gap-3 text-[13px]">
            <li className="flex items-center justify-between gap-3 rounded-[14px] bg-warn-soft px-4 py-3 text-warn">
              <span className="flex items-center gap-2">
                <Clock size={16} aria-hidden="true" />
                {pending.length} pending order{pending.length === 1 ? "" : "s"} awaiting action
              </span>
              <Link
                href="/seller/orders"
                className="shrink-0 font-bold underline"
                data-testid="seller-action-pending"
              >
                Open orders
              </Link>
            </li>
            <li className="flex items-center justify-between gap-3 rounded-[14px] bg-info-soft px-4 py-3 text-info">
              <span className="flex items-center gap-2">
                <PackageOpen size={16} aria-hidden="true" />
                {ready.length} order{ready.length === 1 ? "" : "s"} ready to ship
              </span>
              <Link
                href="/seller/orders"
                className="shrink-0 font-bold underline"
                data-testid="seller-action-ready"
              >
                Review queue
              </Link>
            </li>
            {stalePending.length > 0 && (
              <li className="flex items-center gap-2 rounded-[14px] bg-leaf px-4 py-3 text-brand-deep">
                <Clock size={16} aria-hidden="true" />
                {stalePending.length} pending order{stalePending.length === 1 ? " is" : "s are"} older than 24 hours
              </li>
            )}
          </ul>
          <h3 className="mt-6 text-[14px] font-bold text-ink">Quick links</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { href: "/seller/orders", label: "Manage orders" },
              { href: "/seller/products", label: "Import products" },
              { href: "/seller/finances", label: "View statements" },
              { href: "/seller/returns", label: "Returns & Claims" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center justify-between gap-2 rounded-[14px] bg-cream px-3 text-[13px] font-medium text-ink hover:bg-sand"
              >
                {link.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[14px] bg-paper p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-ink">Recent orders</h3>
          <Link
            href="/seller/orders"
            className="text-[13px] font-bold text-brand hover:underline"
          >
            View all
          </Link>
        </div>
        {/* Desktop table; mobile gets a card list (no horizontal scroll). */}
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-sand/60 text-[11px] uppercase tracking-wide text-forest-light">
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-sand/40">
                  <td className="px-3 py-3">
                    <Link
                      href={`/seller/orders/detail?id=${order.id}`}
                      className="font-mono text-[12px] font-bold text-brand hover:underline"
                    >
                      {order.id}
                    </Link>
                    <p className="text-[12px] text-muted">{orderCreatedLabel(order.created)}</p>
                  </td>
                  <td className="max-w-[220px] px-3 py-3 text-muted">{itemsSummary(order.items)}</td>
                  <td className="px-3 py-3">
                    {order.customer}
                    <p className="text-[12px] text-muted">{order.city}</p>
                  </td>
                  <td className="px-3 py-3 font-bold text-ink">{formatPrice(order.total)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${sellerStatusClasses(order.status)}`}
                    >
                      {sellerStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile card list mirroring the recent-orders table. */}
        <ul className="mt-4 grid gap-3 md:hidden">
          {recent.map((order) => (
            <li key={order.id} className="rounded-[14px] bg-cream p-4">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={`/seller/orders/detail?id=${order.id}`}
                  className="font-mono text-[12px] font-bold text-brand hover:underline"
                >
                  {order.id}
                </Link>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${sellerStatusClasses(order.status)}`}
                >
                  {sellerStatusLabel(order.status)}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-muted">{orderCreatedLabel(order.created)}</p>
              <p className="mt-2 text-[13px] text-muted">{itemsSummary(order.items)}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-[12px] text-muted">
                  {order.customer}
                  <span className="mx-1">·</span>
                  {order.city}
                </p>
                <p className="text-[13px] font-bold text-ink">{formatPrice(order.total)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
