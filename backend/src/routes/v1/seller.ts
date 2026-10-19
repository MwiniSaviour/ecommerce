// Seller fulfillment lifecycle: scoped order list, status transitions,
// the commission ledger, and the seller's product catalog. Labels mirror
// src/lib/seller-orders.ts.
import { Hono } from "hono";
import { z } from "zod";
import { and, eq, inArray, desc, asc } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { orderHistory, orderLines, orders, products } from "../../db/schema.js";
import { orderToSeller, productToClient } from "../../serialize.js";
import { requireAuth, requireRole, type AuthUser } from "../../auth/jwt.js";

export const sellerRoutes = new Hono<{ Variables: { authUser: AuthUser } }>();

const TRANSITIONS: Record<
  string,
  { from: string[]; to: string; label: string }
> = {
  "ready-to-ship": { from: ["pending"], to: "ready-to-ship", label: "Marked ready to ship" },
  shipped: { from: ["ready-to-ship"], to: "shipped", label: "Handed to Kora Express" },
  cancel: {
    from: ["pending", "ready-to-ship"],
    to: "cancelled",
    label: "Cancelled by seller",
  },
  return: { from: ["shipped"], to: "returned", label: "Return received" },
};

sellerRoutes.use("*", requireAuth, requireRole("seller"));

// Orders containing this seller's products, with only their own lines scoped.
sellerRoutes.get("/orders", async (context) => {
  const seller = context.get("authUser");
  const db = getDb();

  const scopedLines = await db
    .select({ line: orderLines, order: orders })
    .from(orderLines)
    .innerJoin(products, eq(products.id, orderLines.productId))
    .innerJoin(orders, eq(orders.id, orderLines.orderId))
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(orders.createdAt));
  if (scopedLines.length === 0) return context.json([]);

  const orderIds = [...new Set(scopedLines.map((row) => row.order.id))];
  const historyRows = await db
    .select()
    .from(orderHistory)
    .where(inArray(orderHistory.orderId, orderIds))
    .orderBy(asc(orderHistory.at));

  // Order rows in stable newest-first order with only the seller's lines.
  type Scoped = { order: typeof orders.$inferSelect; lines: typeof orderLines.$inferSelect[] };
  const byOrder = new Map<string, Scoped>();
  for (const row of scopedLines) {
    let entry = byOrder.get(row.order.id);
    if (!entry) {
      entry = { order: row.order, lines: [] };
      byOrder.set(row.order.id, entry);
    }
    entry.lines.push(row.line);
  }

  const historyByOrder = new Map<string, { at: Date; label: string }[]>();
  for (const row of historyRows) {
    let list = historyByOrder.get(row.orderId);
    if (!list) {
      list = [];
      historyByOrder.set(row.orderId, list);
    }
    list.push({ at: row.at, label: row.label });
  }

  // Keep the original scopedLines order (newest-first by order createdAt).
  const serialized: unknown[] = [];
  const seen = new Set<string>();
  for (const row of scopedLines) {
    if (seen.has(row.order.id)) continue;
    seen.add(row.order.id);
    const scoped = byOrder.get(row.order.id)!;
    serialized.push(
      orderToSeller(scoped.order, scoped.lines, historyByOrder.get(row.order.id) ?? []),
    );
  }
  return context.json(serialized);
});

sellerRoutes.patch("/orders/:id", async (context) => {
  const seller = context.get("authUser");
  const orderId = context.req.param("id");
  const parsed = z
    .object({ action: z.enum(["ready-to-ship", "shipped", "cancel", "return"]) })
    .safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: "Invalid request" }, 400);
  }
  const action = TRANSITIONS[parsed.data.action];
  const db = getDb();

  // Ownership: the order must contain a line of this seller's product.
  const [owned] = await db
    .select({ id: orders.id, sellerStatus: orders.sellerStatus })
    .from(orders)
    .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderLines.productId))
    .where(and(eq(orders.id, orderId), eq(products.sellerId, seller.id)))
    .limit(1);
  if (!owned) {
    return context.json({ error: "Order not found" }, 404);
  }
  if (!action.from.includes(owned.sellerStatus)) {
    return context.json(
      { error: `Cannot ${parsed.data.action} an order in "${owned.sellerStatus}"` },
      409,
    );
  }

  const now = new Date();
  await db
    .update(orders)
    .set({ sellerStatus: action.to })
    .where(eq(orders.id, orderId));
  await db.insert(orderHistory).values({ orderId, at: now, label: action.label });

  const [lineRows, [orderRow]] = await Promise.all([
    db.select().from(orderLines).where(eq(orderLines.orderId, orderId)),
    db.select().from(orders).where(eq(orders.id, orderId)).limit(1),
  ]);
  return context.json(orderToSeller(orderRow, lineRows, [{ at: now, label: action.label }]));
});

// Per-order commission ledger: what the seller grosses, what Kora keeps.
sellerRoutes.get("/ledger", async (context) => {
  const seller = context.get("authUser");
  const db = getDb();

  const rows = await db
    .select({ order: orders, subtotal: orders.subtotal })
    .from(orders)
    .innerJoin(orderLines, eq(orderLines.orderId, orders.id))
    .innerJoin(products, eq(products.id, orderLines.productId))
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(orders.createdAt));

  const ledger: unknown[] = [];
  const seen = new Set<string>();
  for (const { order } of rows) {
    if (seen.has(order.id)) continue;
    seen.add(order.id);
    const gross = Math.round(order.subtotal * 100) / 100;
    const commission = Math.round(order.commission * 100) / 100;
    ledger.push({
      orderId: order.id,
      createdAt: order.createdAt.toISOString(),
      gross,
      commission,
      net: Math.round((gross - commission) * 100) / 100,
    });
  }
  return context.json(ledger);
});

sellerRoutes.get("/products", async (context) => {
  const seller = context.get("authUser");
  const rows = await getDb()
    .select()
    .from(products)
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt));
  return context.json(rows.map(productToClient));
});

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(["Tech", "Home", "Fashion", "Beauty", "Sports"]),
  brand: z.string().min(1).max(100),
  price: z.number().positive(),
  compareAt: z.number().positive().optional(),
  stock: z.number().int().nonnegative(),
  image: z.string().min(1).max(2000),
  badges: z.array(z.string().max(40)).max(6).optional(),
  express: z.boolean().optional(),
  officialStore: z.boolean().optional(),
  sellerName: z.string().max(120).optional(),
});

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

sellerRoutes.post("/products", async (context) => {
  const seller = context.get("authUser");
  const parsed = createProductSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: "Invalid request" }, 400);
  }
  const data = parsed.data;
  const now = new Date();
  const id = `p-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const slug = `${slugify(data.name)}-${Math.random().toString(36).slice(2, 8)}`;

  const [created] = await getDb()
    .insert(products)
    .values({
      id,
      sellerId: seller.id,
      slug,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      price: data.price,
      compareAt: data.compareAt ?? null,
      rating: 0,
      stock: data.stock,
      image: data.image,
      badges: data.badges ?? [],
      sellerName: data.sellerName ?? seller.business ?? seller.name,
      officialStore: data.officialStore ?? null,
      express: data.express ?? null,
    })
    .returning();

  return context.json(productToClient(created), 201);
});
