// Fulfillment helpers shared by checkout, webhook and driver routes.
import { getDb } from "./db/index.js";
import {
  driverTaskHistory,
  driverTasks,
  orderHistory,
  orders,
  orderLines,
  payments,
  products,
  users,
} from "./db/schema.js";
import { eq } from "drizzle-orm";

type OrderRow = typeof orders.$inferSelect;
type OrderLineRow = typeof orderLines.$inferSelect;

function hashSeed(seed: string): number {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return sum;
}

// Creates one unassigned delivery task for a "delivery" order, picking up from
// the first line's seller (business name, else personal name). Returns the
// created task id; null when the order is not a delivery order.
export async function createDriverTaskForOrder(
  order: OrderRow,
  lines: OrderLineRow[],
): Promise<string | null> {
  if (order.deliveryMethod !== "delivery" || lines.length === 0) {
    return null;
  }

  const firstLine = lines[0];
  const productRows = await getDb()
    .select()
    .from(products)
    .where(eq(products.id, firstLine.productId))
    .limit(1);
  if (productRows.length === 0) {
    throw new Error("Order line references an unknown product; cannot create a driver task.");
  }

  const sellerRows = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, productRows[0].sellerId))
    .limit(1);
  if (sellerRows.length === 0) {
    throw new Error("Order line references an unknown seller; cannot create a driver task.");
  }

  const seller = sellerRows[0];
  const address = (order.address ?? {}) as Record<string, string>;
  const hash = hashSeed(order.id);
  const isCod = order.paymentMethod === "pod";
  const city = address.city || "Accra";

  const [task] = await getDb()
    .insert(driverTasks)
    .values({
      driverId: null,
      orderId: order.id,
      pickupName: seller.business || seller.name,
      pickupAddress: `${productRows[0].sellerName ?? seller.name} — ${city}, Ghana`,
      pickupHub: seller.business || seller.name,
      dropoffName: address.fullname || order.contactEmail,
      dropoffAddress: [address.street, address.city, address.region]
        .filter(Boolean)
        .join(", ") || "Ghana",
      dropoffArea: city,
      customer: order.contactPhone || order.contactEmail,
      phone: order.contactPhone || "",
      payment: isCod ? "COD" : "prepaid",
      codAmount: isCod ? order.total : null,
      itemsSummary: lines
        .map((l) => `${l.quantity}× ${l.name}`)
        .join(", "),
      distanceKm: 4 + (hash % 9),
      etaMin: 20 + (hash % 21),
      earnings: Math.round(order.total * 0.12),
      status: "offered",
    })
    .returning();

  await getDb().insert(driverTaskHistory).values({
    taskId: task.id,
    label: "Task offered to you",
  });
  await getDb().insert(orderHistory).values({
    orderId: order.id,
    label: "Driver task offered",
  });
  return task.id;
}

// Marks a payment reference as successful: flips order status to "paid",
// updates the payments row, appends history and creates the prepaid driver
// task. Returns the updated order row (null when the reference is unknown).
export async function markPaymentSuccess(reference: string): Promise<OrderRow | null> {
  const db = getDb();
  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.reference, reference))
    .limit(1);
  if (paymentRows.length === 0) {
    return null;
  }
  const payment = paymentRows[0];
  const now = new Date();

  const wasAlreadyPaid = payment.status === "success";
  if (wasAlreadyPaid) {
    const [already] = await db.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
    return already ?? null;
  }

  const [order] = await db
    .update(orders)
    .set({ status: "paid" })
    .where(eq(orders.id, payment.orderId))
    .returning();

  const orderLineRows = await db
    .select()
    .from(orderLines)
    .where(eq(orderLines.orderId, order.id));

  await db
    .update(payments)
    .set({ status: "success", paidAt: now })
    .where(eq(payments.id, payment.id));
  await db.insert(orderHistory).values({
    orderId: order.id,
    label: "Payment received",
  });
  if (wasAlreadyPaid) {
    await db.insert(orderHistory).values({
      orderId: order.id,
      label: "Order paid (retry)",
    });
  }
  if (!wasAlreadyPaid) {
    await createDriverTaskForOrder(order, orderLineRows);
  }
  return order;
}
