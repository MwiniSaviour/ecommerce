"use client";

// DESIGN DIRECTION: Aries & Co. Phones order pipeline — inspired by Jumia
// seller hub's tabbed queue with bulk actions; not Jumia-verified.

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  PackageOpen,
  Printer,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { useStorefront } from "@/components/storefront-provider";
import { formatPrice } from "@/lib/format";
import { getSellerProductById } from "@/lib/seller-products";
import {
  orderCreatedLabel,
  sellerStatusClasses,
  sellerStatusLabel,
  updateSellerOrders,
  useSellerOrders,
  type SellerOrder,
} from "@/lib/seller-orders";

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "ready-to-ship", label: "Ready to Ship" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "returned", label: "Returned & Claims" },
  { id: "cancelled", label: "Cancelled" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EMPTY_STATES: Record<TabId, { icon: typeof Clock; title: string; body: string }> = {
  pending: {
    icon: Clock,
    title: "No pending orders",
    body: "New orders land here as soon as buyers check out.",
  },
  "ready-to-ship": {
    icon: PackageOpen,
    title: "Nothing is waiting to ship",
    body: "Mark pending orders as ready to ship to build your dropoff queue.",
  },
  shipped: {
    icon: Truck,
    title: "No orders in transit",
    body: "Orders you hand to Kora Express show up here with live status.",
  },
  delivered: {
    icon: CheckCircle2,
    title: "No delivered orders yet",
    body: "Shipped orders appear here once delivery is confirmed.",
  },
  returned: {
    icon: RotateCcw,
    title: "No returns or claims",
    body: "Buyer returns and claims will be listed here for review.",
  },
  cancelled: {
    icon: XCircle,
    title: "No cancelled orders",
    body: "Orders you cancel are kept here for your records.",
  },
};

export default function SellerOrdersPage() {
  const { showToast } = useStorefront();
  const orders = useSellerOrders();
  const [tab, setTab] = useState<TabId>("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = orders.filter((order) =>
    tab === "delivered" ? false : order.status === tab,
  );
  const allSelected = visible.length > 0 && visible.every((order) => selected.has(order.id));
  const selectedOrders = orders.filter((order) => selected.has(order.id));
  const canMarkReady =
    selectedOrders.length > 0 && selectedOrders.every((order) => order.status === "pending");
  const canCancel =
    selectedOrders.length > 0 &&
    selectedOrders.every(
      (order) => order.status === "pending" || order.status === "ready-to-ship",
    );

  const toggleOrder = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(() => (allSelected ? new Set() : new Set(visible.map((order) => order.id))));
  };

  const bulkReadyToShip = () => {
    const count = selected.size;
    updateSellerOrders((current) =>
      current.map((order) =>
        selected.has(order.id) && order.status === "pending"
          ? {
              ...order,
              status: "ready-to-ship",
              history: [
                ...order.history,
                { at: new Date().toISOString(), label: "Marked ready to ship" },
              ],
            }
          : order,
      ),
    );
    showToast(`${count} order${count === 1 ? "" : "s"} marked ready to ship`);
    setSelected(new Set());
  };

  const bulkCancel = () => {
    const count = selected.size;
    updateSellerOrders((current) =>
      current.map((order) =>
        selected.has(order.id) && (order.status === "pending" || order.status === "ready-to-ship")
          ? {
              ...order,
              status: "cancelled",
              history: [
                ...order.history,
                { at: new Date().toISOString(), label: "Cancelled by seller" },
              ],
            }
          : order,
      ),
    );
    showToast(`${count} order${count === 1 ? "" : "s"} cancelled`);
    setSelected(new Set());
  };

  const bulkPrint = (kind: "labels" | "invoices") => {
    showToast(
      `${selected.size} ${kind} prepared — open an order to print`,
    );
  };

  const itemsSummary = (order: SellerOrder): string =>
    order.items
      .map((item) => `${getSellerProductById(item.id)?.name ?? item.id} ×${item.qty}`)
      .join(", ");

  const emptyState = EMPTY_STATES[tab];
  const EmptyIcon = emptyState.icon;

  return (
    <div className="mx-auto grid max-w-5xl gap-4" data-testid="seller-orders">
      <div>
        <h2 className="text-[18px] font-bold text-ink">Orders</h2>
        <p className="mt-1 text-[13px] text-muted">
          Process the queue, mark orders ready and print what Kora Express needs.
        </p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Order filters">
        {TABS.map((entry) => {
          const count = orders.filter((order) =>
            entry.id === "delivered" ? false : order.status === entry.id,
          ).length;
          const active = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(entry.id);
                setSelected(new Set());
              }}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors ${
                active ? "bg-brand text-white" : "bg-paper text-ink hover:bg-sand"
              }`}
              data-testid={`seller-tab-${entry.id}`}
            >
              {entry.label}
              <span
                className={`rounded-full px-1.5 text-[11px] font-bold ${active ? "bg-white/20" : "bg-sand"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center rounded-[14px] bg-paper px-6 py-12 text-center shadow-sm">
          <span className="flex size-10 items-center justify-center rounded-full bg-sand">
            <EmptyIcon size={20} className="text-forest-light" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-[14px] font-bold text-ink">{emptyState.title}</h3>
          <p className="mt-1 max-w-sm text-[13px] text-muted">{emptyState.body}</p>
          <Link
            href="/seller/dashboard"
            className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-[14px] font-bold text-white transition-colors hover:bg-brand-deep"
          >
            Back to dashboard
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] bg-paper shadow-sm">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border bg-sand/60 text-[11px] uppercase tracking-wide text-forest-light">
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all visible orders"
                    data-testid="seller-select-all"
                  />
                </th>
                <th className="px-3 py-2 font-medium">Order</th>
                <th className="px-3 py-2 font-medium">Items</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-sand/40">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      aria-label={`Select order ${order.id}`}
                      data-testid={`seller-select-${order.id}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/seller/orders/${order.id}`}
                      className="font-mono text-[12px] font-bold text-brand hover:underline"
                    >
                      {order.id}
                    </Link>
                    <p className="text-[12px] text-muted">{orderCreatedLabel(order.created)}</p>
                  </td>
                  <td className="max-w-[220px] px-3 py-3 text-muted">{itemsSummary(order)}</td>
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
      )}

      {selected.size > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 flex flex-wrap items-center gap-2 border-t border-border bg-paper px-4 py-3 shadow-md"
          data-testid="seller-bulk-bar"
        >
          <p className="mr-auto text-[13px] font-bold text-ink">
            {selected.size} order{selected.size === 1 ? "" : "s"} selected
          </p>
          <button
            type="button"
            onClick={bulkReadyToShip}
            disabled={!canMarkReady}
            className="flex min-h-11 items-center justify-center rounded-full bg-brand px-4 text-[13px] font-bold text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="seller-bulk-ready"
          >
            <PackageOpen size={16} className="mr-2" aria-hidden="true" />
            Ready to Ship
          </button>
          <button
            type="button"
            onClick={() => bulkPrint("labels")}
            className="flex min-h-11 items-center justify-center rounded-full border border-border bg-paper px-4 text-[13px] font-bold text-brand hover:bg-leaf"
            data-testid="seller-bulk-labels"
          >
            <Printer size={16} className="mr-2" aria-hidden="true" />
            Print Labels
          </button>
          <button
            type="button"
            onClick={() => bulkPrint("invoices")}
            className="flex min-h-11 items-center justify-center rounded-full border border-border bg-paper px-4 text-[13px] font-bold text-brand hover:bg-leaf"
            data-testid="seller-bulk-invoices"
          >
            <FileText size={16} className="mr-2" aria-hidden="true" />
            Print Invoices
          </button>
          <button
            type="button"
            onClick={bulkCancel}
            disabled={!canCancel}
            className="flex min-h-11 items-center justify-center rounded-full border border-hold/40 px-4 text-[13px] font-bold text-hold hover:bg-hold-soft disabled:cursor-not-allowed disabled:opacity-40"
            data-testid="seller-bulk-cancel"
          >
            <XCircle size={16} className="mr-2" aria-hidden="true" />
            Cancel items
          </button>
        </div>
      )}
    </div>
  );
}
