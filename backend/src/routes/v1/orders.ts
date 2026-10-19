// Customer order history: authenticated listing and detail lookup.
import { Hono } from "hono";
import { eq, desc, inArray } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { orderLines, orders } from "../../db/schema.js";
import { orderToStored } from "../../serialize.js";
import { requireAuth, type AuthUser } from "../../auth/jwt.js";

export const ordersRoutes = new Hono<{ Variables: { authUser: AuthUser } }>();

ordersRoutes.get("/", requireAuth, async (context) => {
  const user = context.get("authUser");
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, user.id))
    .orderBy(desc(orders.createdAt));
  const linesByOrder = new Map<string, typeof orderLines.$inferSelect[]>();
  if (rows.length > 0) {
    const allLines = await db
      .select()
      .from(orderLines)
      .where(inArray(orderLines.orderId, rows.map((r) => r.id)));
    for (const line of allLines) {
      const list = linesByOrder.get(line.orderId) ?? [];
      list.push(line);
      linesByOrder.set(line.orderId, list);
    }
  }
  return context.json(rows.map((o) => orderToStored(o, linesByOrder.get(o.id) ?? [])));
});
