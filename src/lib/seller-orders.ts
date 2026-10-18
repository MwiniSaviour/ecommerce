import { useCallback, useSyncExternalStore } from "react";
import { shipmentFeeForItems } from "@/components/cart-fees";
import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";
import { getSellerProductById } from "@/lib/seller-products";

// DESIGN DIRECTION: Aries & Co. Phones order pipeline — inspired by Jumia
// seller hub's pending → ready to ship → shipped flow; not Jumia-verified.
export type SellerOrderStatus =
  | "pending"
  | "ready-to-ship"
  | "shipped"
  | "returned"
  | "cancelled";

export type SellerOrderMethod = "dropoff" | "pickup station" | "door";

export type SellerOrder = {
  id: string;
  created: string;
  items: { id: string; qty: number }[];
  customer: string;
  city: string;
  method: SellerOrderMethod;
  total: number;
  status: SellerOrderStatus;
  history: { at: string; label: string }[];
};

export const SELLER_ORDERS_KEY = "kora-market-seller-orders-v1";

export const SELLER_COMMISSION_RATE = 0.25;

export function sellerNowMs(): number {
  return Date.now();
}

export function priceOrder(items: { id: string; qty: number }[]): {
  subtotal: number;
  shipment: number;
  commission: number;
  total: number;
} {
  let subtotal = 0;
  for (const item of items) {
    const product = getSellerProductById(item.id);
    if (product) subtotal += product.price * item.qty;
  }
  const shipment = shipmentFeeForItems(
    items.map((item) => ({ id: item.id, quantity: item.qty })),
  );
  const commission = Math.round(subtotal * SELLER_COMMISSION_RATE);
  return { subtotal, shipment, commission, total: subtotal + shipment + commission };
}

const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * 3_600_000).toISOString();

type SeedOrder = {
  id: string;
  hours: number;
  items: { id: string; qty: number }[];
  customer: string;
  city: string;
  method: SellerOrderMethod;
  status: SellerOrderStatus;
};

function buildSeedOrder(seed: SeedOrder): SellerOrder {
  const history: { at: string; label: string }[] = [
    { at: hoursAgo(seed.hours + 2), label: "Order placed" },
  ];
  if (seed.status !== "pending" && seed.status !== "cancelled") {
    history.push({ at: hoursAgo(seed.hours + 1), label: "Marked ready to ship" });
  }
  if (seed.status === "shipped" || seed.status === "returned") {
    history.push({ at: hoursAgo(seed.hours), label: "Handed to Kora Express" });
  }
  if (seed.status === "returned") {
    history.push({ at: hoursAgo(Math.max(1, seed.hours - 6)), label: "Return received" });
  }
  if (seed.status === "cancelled") {
    history.push({ at: hoursAgo(Math.max(1, seed.hours - 4)), label: "Cancelled by seller" });
  }
  return {
    id: seed.id,
    created: hoursAgo(seed.hours),
    items: seed.items,
    customer: seed.customer,
    city: seed.city,
    method: seed.method,
    total: priceOrder(seed.items).total,
    status: seed.status,
    history,
  };
}

const seedDefs: SeedOrder[] = [
  { id: "KOS-1041", hours: 3, items: [{ id: "studio-headphones", qty: 1 }], customer: "Ama Serwaa", city: "Accra", method: "door", status: "pending" },
  { id: "KOS-1042", hours: 5, items: [{ id: "everyday-smartphone", qty: 1 }, { id: "city-tote", qty: 1 }], customer: "Kwame Boateng", city: "Kumasi", method: "pickup station", status: "pending" },
  { id: "KOS-1043", hours: 9, items: [{ id: "glow-skincare-duo", qty: 2 }], customer: "Efua Mensah", city: "Tema", method: "door", status: "pending" },
  { id: "KOS-1044", hours: 14, items: [{ id: "countertop-coffee-maker", qty: 1 }], customer: "Kofi Adjei", city: "Takoradi", method: "dropoff", status: "pending" },
  { id: "KOS-1045", hours: 20, items: [{ id: "lightweight-runners", qty: 1 }], customer: "Abena Owusu", city: "Accra", method: "pickup station", status: "pending" },
  { id: "KOS-1038", hours: 28, items: [{ id: "work-weekend-laptop", qty: 1 }], customer: "Yaw Darko", city: "Tema", method: "door", status: "ready-to-ship" },
  { id: "KOS-1036", hours: 31, items: [{ id: "classic-watch", qty: 2 }], customer: "Adjoa Nkrumah", city: "Kasoa", method: "pickup station", status: "ready-to-ship" },
  { id: "KOS-1035", hours: 40, items: [{ id: "studio-headphones", qty: 1 }, { id: "lightweight-runners", qty: 1 }], customer: "Nana Gyasi", city: "Kumasi", method: "dropoff", status: "ready-to-ship" },
  { id: "KOS-1029", hours: 74, items: [{ id: "everyday-smartphone", qty: 1 }], customer: "Esi Baidoo", city: "Accra", method: "door", status: "shipped" },
  { id: "KOS-1024", hours: 96, items: [{ id: "city-tote", qty: 1 }, { id: "glow-skincare-duo", qty: 1 }], customer: "Kojo Asante", city: "Tema", method: "pickup station", status: "shipped" },
  { id: "KOS-1016", hours: 130, items: [{ id: "countertop-coffee-maker", qty: 1 }], customer: "Akua Frimpong", city: "Koforidua", method: "dropoff", status: "returned" },
  { id: "KOS-1012", hours: 150, items: [{ id: "classic-watch", qty: 1 }], customer: "Sena Dzikunu", city: "Ho", method: "door", status: "cancelled" },
];

export const sellerOrders: SellerOrder[] = seedDefs.map(buildSeedOrder);

function isSellerOrder(entry: unknown): entry is SellerOrder {
  if (typeof entry !== "object" || entry === null) return false;
  const order = entry as Partial<SellerOrder>;
  return (
    typeof order.id === "string" &&
    typeof order.created === "string" &&
    Array.isArray(order.items) &&
    typeof order.customer === "string" &&
    typeof order.city === "string" &&
    typeof order.method === "string" &&
    typeof order.total === "number" &&
    typeof order.status === "string" &&
    Array.isArray(order.history)
  );
}

function parseOrders(raw: string | null): SellerOrder[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const orders: SellerOrder[] = [];
    for (const entry of parsed) {
      if (!isSellerOrder(entry)) return null;
      orders.push(entry);
    }
    return orders;
  } catch {
    return null;
  }
}

export function readSellerOrders(): SellerOrder[] {
  return parseOrders(readStorageRaw(SELLER_ORDERS_KEY)) ?? sellerOrders;
}

export function saveSellerOrders(orders: SellerOrder[]): void {
  writeStorage(SELLER_ORDERS_KEY, JSON.stringify(orders));
}

export function updateSellerOrders(updater: (orders: SellerOrder[]) => SellerOrder[]): void {
  saveSellerOrders(updater(readSellerOrders()));
}

export function useSellerOrders(): SellerOrder[] {
  const raw = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => subscribeStorageKey(SELLER_ORDERS_KEY, onStoreChange), []),
    () => readStorageRaw(SELLER_ORDERS_KEY),
    () => null,
  );
  return parseOrders(raw) ?? sellerOrders;
}

export function orderCreatedLabel(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.max(1, Math.round(ms / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function sellerStatusLabel(status: SellerOrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "ready-to-ship":
      return "Ready to ship";
    case "shipped":
      return "Shipped";
    case "returned":
      return "Returned";
    case "cancelled":
      return "Cancelled";
  }
}

export function sellerStatusClasses(status: SellerOrderStatus): string {
  switch (status) {
    case "pending":
      return "bg-warn-soft text-warn";
    case "ready-to-ship":
      return "bg-info-soft text-info";
    case "shipped":
      return "bg-ok-soft text-ok";
    case "returned":
      return "bg-leaf text-brand-deep";
    case "cancelled":
      return "bg-sand text-forest-light";
  }
}
