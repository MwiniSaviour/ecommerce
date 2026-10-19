import { Hono } from "hono";
import { getDb } from "../../db/index.js";
import { products } from "../../db/schema.js";
import { and, eq, or } from "drizzle-orm";
import { productToClient } from "../../serialize.js";

export const productRoutes = new Hono();

productRoutes.get("/", async (context) => {
  const db = getDb();
  const rows = await db.select().from(products).where(eq(products.active, true));
  return context.json({ products: rows.map(productToClient) });
});

productRoutes.get("/:idOrSlug", async (context) => {
  const key = context.req.param("idOrSlug");
  const db = getDb();
  const found = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), or(eq(products.id, key), eq(products.slug, key))));
  if (found.length === 0) return context.json({ error: "Product not found" }, 404);
  return context.json(productToClient(found[0]));
});
