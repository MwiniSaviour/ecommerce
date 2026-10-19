// Row -> client shape serializers shared by the v1 routes.
import type { orders, orderLines, products, driverTasks } from "./db/schema.js";

type ProductRow = typeof products.$inferSelect;
type OrderRow = typeof orders.$inferSelect;
type OrderLineRow = typeof orderLines.$inferSelect;
type DriverTaskRow = typeof driverTasks.$inferSelect;

export function productToClient(p: ProductRow) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    category: p.category,
    brand: p.brand,
    price: p.price,
    ...(p.compareAt !== null ? { compareAt: p.compareAt } : {}),
    rating: p.rating,
    stock: p.stock,
    image: p.image,
    badges: p.badges,
    seller: { name: p.sellerName ?? "", ...(p.officialStore ? { officialStore: true } : {}) },
    delivery: { express: p.express === true },
  };
}

export function orderLineToStored(l: OrderLineRow) {
  return {
    id: l.productId,
    slug: l.productId, // slug not persisted on lines; id lookup covers order detail views
    name: l.name,
    image: l.image,
    price: l.price,
    quantity: l.quantity,
  };
}

export function orderToStored(o: OrderRow, lines: OrderLineRow[]) {
  return {
    id: o.id,
    placedAt: o.createdAt.toISOString(),
    contact: { email: o.contactEmail, phone: o.contactPhone },
    deliveryMethod: o.deliveryMethod as "delivery" | "pickup",
    address: o.address ?? null,
    paymentMethod: o.paymentMethod as "pod" | "momo" | "card",
    subtotal: o.subtotal,
    shipmentFee: o.shipmentFee,
    total: o.total,
    items: lines.map(orderLineToStored),
  };
}

export function orderToSeller(o: OrderRow, lines: OrderLineRow[], history: { at: Date; label: string }[]) {
  const address = (o.address ?? {}) as Record<string, string>;
  return {
    id: o.id,
    created: o.createdAt.toISOString(),
    items: lines.map((l) => ({ id: l.productId, qty: l.quantity })),
    customer: address.fullname || o.contactEmail,
    city: address.city || "",
    method: o.deliveryMethod === "delivery" ? "door" : "pickup station",
    // Seller ledger shows commission on top of customer total.
    total: o.total + o.commission,
    status: o.sellerStatus,
    history: history.map((h) => ({ at: h.at.toISOString(), label: h.label })),
  };
}

export function taskToDriver(
  t: DriverTaskRow,
  history: { at: Date; label: string }[],
) {
  return {
    id: t.id,
    pickup: { name: t.pickupName, address: t.pickupAddress, hub: t.pickupHub },
    dropoff: { name: t.dropoffName, address: t.dropoffAddress, area: t.dropoffArea },
    customer: t.customer,
    phone: t.phone,
    payment: t.payment as "prepaid" | "COD",
    codAmount: t.codAmount,
    itemsSummary: t.itemsSummary,
    distanceKm: t.distanceKm,
    etaMin: t.etaMin,
    earnings: t.earnings,
    status: t.status,
    // Client DriverTaskHistoryEntry.at is epoch ms, not ISO.
    history: history.map((h) => ({ at: h.at.getTime(), label: h.label })),
  };
}

export function userToClient(u: { id: string; role: string; email: string; name: string; business: string | null; createdAt: Date }) {
  return {
    id: u.id,
    role: u.role,
    email: u.email,
    name: u.name,
    business: u.business ?? undefined,
    since: u.createdAt.toISOString(),
  };
}
