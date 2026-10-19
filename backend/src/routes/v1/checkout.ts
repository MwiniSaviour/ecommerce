// Checkout: server-side price truth (client prices are ignored) and
// payment boundaries. Draft recomputes fees; /orders prices, persists,
// initializes Paystack and creates the POD driver task at checkout time.
import { Hono } from "hono";
import { z } from "zod";
import { inArray, eq } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { orderHistory, orderLines, orders, payments, products } from "../../db/schema.js";
import { computePriceOrder, ghsToPesewas } from "../../pricing.js";
import {
  initPaystackTransaction,
  newReference,
  paystackConfigured,
  verifyPaystackTransaction,
} from "../../paystack/paystack.js";
import { orderToStored, productToClient } from "../../serialize.js";
import { createDriverTaskForOrder, markPaymentSuccess } from "../../fulfillment.js";
import { optionalAuth, type AuthUser } from "../../auth/jwt.js";

export const checkoutRoutes = new Hono<{ Variables: { authUser: AuthUser } }>();

const cartRefSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1),
});

const draftSchema = z.object({ items: z.array(cartRefSchema) });

const orderSchema = z.object({
  items: z.array(cartRefSchema).min(1),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(5),
  }),
  deliveryMethod: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["pod", "momo", "card"]),
  // AddressValues from the client may carry non-address extras (e.g.
  // saveAddress); they are ignored here, only string address fields persist.
  address: z.record(z.string(), z.unknown()).optional(),
});

function cleanAddress(
  raw: Record<string, unknown> | undefined,
): Record<string, string> | null {
  if (!raw) return null;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key === "saveAddress" || value === undefined || value === null) continue;
    if (typeof value === "string") out[key] = value;
    else if (typeof value === "number" || typeof value === "boolean") out[key] = String(value);
  }
  return out;
}

checkoutRoutes.post("/draft", async (context) => {
  const parsed = draftSchema.safeParse(await context.req.json());
  if (!parsed.success) return context.json({ error: "Invalid request" }, 400);
  const refs = parsed.data.items;
  if (refs.length === 0) {
    return context.json({ items: [], subtotal: 0, shipmentFee: 0, commission: 0, total: 0, missing: [] });
  }
  const rows = await getDb()
    .select()
    .from(products)
    .where(inArray(products.id, refs.map((r) => r.id)));
  const byId = new Map(rows.map((row) => [row.id, row]));
  const priced = computePriceOrder(refs, byId);
  return context.json({
    items: rows.filter((p) => p.active).map(productToClient),
    subtotal: priced.subtotal,
    shipmentFee: priced.shipmentFee,
    commission: priced.commission,
    total: priced.total,
    missing: priced.missing,
  });
});

checkoutRoutes.post("/orders", optionalAuth, async (context) => {
  const parsed = orderSchema.safeParse(await context.req.json());
  if (!parsed.success) return context.json({ error: "Invalid request" }, 400);
  const body = parsed.data;
  const user = context.get("authUser");
  if (user && user.role !== "customer") {
    return context.json({ error: "Only customer accounts place orders" }, 403);
  }

  const rows = await getDb()
    .select()
    .from(products)
    .where(inArray(products.id, body.items.map((r) => r.id)));
  const byId = new Map(rows.map((row) => [row.id, row]));
  const priced = computePriceOrder(body.items, byId);
  if (priced.missing.length > 0) {
    return context.json(
      { error: "Some products are unavailable or no longer active", missing: priced.missing },
      409,
    );
  }

  const db = getDb();
  const [order] = await db
    .insert(orders)
    .values({
      customerId: user ? user.id : null,
      contactEmail: body.contact.email,
      contactPhone: body.contact.phone,
      deliveryMethod: body.deliveryMethod,
      address: body.deliveryMethod === "delivery" ? cleanAddress(body.address) : null,
      paymentMethod: body.paymentMethod,
      subtotal: priced.subtotal,
      shipmentFee: priced.shipmentFee,
      commission: priced.commission,
      total: priced.total,
    })
    .returning();

  const lineValues = body.items.map((ref) => {
    const product = byId.get(ref.id);
    return {
      orderId: order.id,
      productId: ref.id,
      name: product?.name ?? "",
      image: product?.image ?? "",
      price: product?.price ?? 0,
      quantity: ref.quantity,
    };
  });
  const lines = await db.insert(orderLines).values(lineValues).returning();
  await db.insert(orderHistory).values({ orderId: order.id, label: "Order placed" });

  const isPod = body.paymentMethod === "pod";
  let reference: string | null = null;
  let checkoutUrl: string | null = null;

  if (!isPod) {
    reference = newReference();
    const method = body.paymentMethod === "card" ? "card" : "momo";
    if (paystackConfigured()) {
      const init = await initPaystackTransaction({
        amountPesewas: ghsToPesewas(order.total),
        email: body.contact.email,
        reference,
      });
      if (init.status) {
        checkoutUrl = init.authorizationUrl;
      }
    }
    await db.insert(payments).values({
      orderId: order.id,
      method,
      reference,
      authorizationUrl: checkoutUrl,
      amountGhs: order.total,
    });
  } else {
    // POD task exists from checkout; a prepaid task is created on payment.
    await createDriverTaskForOrder(order, lines);
  }

  return context.json(
    { order: orderToStored(order, lines), reference, checkoutUrl },
    201,
  );
});

// Verify a payment reference against Paystack and fulfil on success.
// The full order payload is exposed only to the owner: authenticated
// customers matching the order's customerId, or guest callers proving
// knowledge of the contact email. Everyone else gets a minimal status.
const verifySchema = z.object({ email: z.string().email().optional() });

checkoutRoutes.post("/verify/:reference", optionalAuth, async (context) => {
  const rawBody: unknown = await context.req.json().catch(() => ({}));
  const parsedBody = verifySchema.safeParse(rawBody ?? {});
  if (!parsedBody.success) return context.json({ error: "Invalid request" }, 400);
  const reference = context.req.param("reference");
  const user = context.get("authUser");
  const db = getDb();
  const paymentRows = await db
    .select()
    .from(payments)
    .where(eq(payments.reference, reference))
    .limit(1);
  if (paymentRows.length === 0) {
    return context.json({ error: "Unknown payment reference" }, 404);
  }
  const payment = paymentRows[0];
  const [order] = await db.select().from(orders).where(eq(orders.id, payment.orderId)).limit(1);
  const owned = Boolean(
    order &&
      ((order.customerId && user && order.customerId === user.id) ||
        (!order.customerId &&
          parsedBody.data.email?.toLowerCase() === order.contactEmail.toLowerCase())),
  );

  if (payment.status === "success" && order) {
    const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, order.id));
    return context.json(owned ? { status: "success", order: orderToStored(order, lines) } : { status: "success" });
  }

  const verified = await verifyPaystackTransaction(reference);
  if (verified.status !== "success") {
    return context.json({ status: verified.status, message: verified.message }, 200);
  }
  const expectedPesewas = ghsToPesewas(payment.amountGhs);
  if (verified.amountPesewas !== null && verified.amountPesewas !== expectedPesewas) {
    return context.json({ status: "failed", message: "Amount mismatch" }, 409);
  }
  const paid = await markPaymentSuccess(reference);
  if (!paid) return context.json({ error: "Unknown payment reference" }, 404);
  if (!owned) return context.json({ status: "success" });
  const paidLines = await db.select().from(orderLines).where(eq(orderLines.orderId, paid.id));
  return context.json({ status: "success", order: orderToStored(paid, paidLines) });
});

// Dev-only shortcut when Paystack keys are absent (seeds/smoke + local tests).
checkoutRoutes.post("/mock-paid/:reference", async (context) => {
  if (paystackConfigured() || process.env.NODE_ENV === "production") {
    return context.json({ error: "Mock payments are dev-only and disabled in production" }, 403);
  }
  const paid = await markPaymentSuccess(context.req.param("reference"));
  if (!paid) return context.json({ error: "Unknown payment reference" }, 404);
  const lines = await getDb().select().from(orderLines).where(eq(orderLines.orderId, paid.id));
  return context.json({ status: "success", order: orderToStored(paid, lines) });
});
