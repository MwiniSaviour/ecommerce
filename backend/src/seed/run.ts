// Dev seed: demo seller + driver + full catalog. Idempotent (onConflictDoNothing).
import { eq } from "drizzle-orm";
import { getDb, closeDb } from "../db/index.js";
import { users, products, driverProfiles } from "../db/schema.js";
import { hashPassword } from "../auth/passwords.js";
import { catalog } from "./catalog.js";

const SELLER_EMAIL = "aries@koravendorhub.com";
const SELLER_PASSWORD = "KoraDemo2026";
const SELLER_NAME = "Aries";
const SELLER_BUSINESS = "Aries & Co. Phones";

async function upsertSeller(): Promise<string> {
  const db = getDb();
  const existing = await db.select().from(users).where(eq(users.email, SELLER_EMAIL));
  if (existing.length > 0) return existing[0].id;
  const inserted = await db
    .insert(users)
    .values({
      role: "seller",
      email: SELLER_EMAIL,
      passwordHash: hashPassword(SELLER_PASSWORD),
      name: SELLER_NAME,
      business: SELLER_BUSINESS,
    })
    .returning({ id: users.id });
  return inserted[0].id;
}

async function upsertCustomer(): Promise<string> {
  const db = getDb();
  const email = "customer@kora-market.test";
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) return existing[0].id;
  const inserted = await db
    .insert(users)
    .values({
      role: "customer",
      email,
      passwordHash: hashPassword("CustomerDemo2026"),
      name: "Adjoa Kora",
    })
    .returning({ id: users.id });
  return inserted[0].id;
}

async function upsertDriver(): Promise<void> {
  const db = getDb();
  const email = "kwame@koraexpress.test";
  const existing = await db.select().from(users).where(eq(users.email, email));
  let driverId: string;
  if (existing.length > 0) {
    driverId = existing[0].id;
  } else {
    const inserted = await db
      .insert(users)
      .values({
        role: "driver",
        email,
        passwordHash: hashPassword("DriverDemo2026"),
        name: "Kwame Osei",
      })
      .returning({ id: users.id });
    driverId = inserted[0].id;
  }
  const profile = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, driverId));
  if (profile.length === 0) {
    await db.insert(driverProfiles).values({
      userId: driverId,
      status: "approved",
      name: "Kwame Osei",
      phone: "+233500000002",
      city: "Accra",
      vehicle: "Motorcycle",
      plate: "GX 2213-24",
      license: "DL-22313211",
      submittedAt: new Date(),
      approvedAt: new Date(),
    });
  }
}

async function seedProducts(sellerId: string): Promise<void> {
  const db = getDb();
  let inserted = 0;
  for (const p of catalog) {
    const existing = await db.select().from(products).where(eq(products.id, p.id));
    if (existing.length > 0) {
      const row = existing[0];
      const changed =
        row.price !== p.price ||
        row.stock !== p.stock ||
        row.name !== p.name ||
        row.description !== p.description;
      if (changed) {
        await db
          .update(products)
          .set({
            name: p.name,
            description: p.description,
            price: p.price,
            compareAt: p.compareAt ?? null,
            rating: p.rating,
            stock: p.stock,
            badges: p.badges,
            sellerName: p.seller?.name ?? null,
            officialStore: p.seller?.officialStore ?? false,
            express: p.delivery?.express ?? false,
          })
          .where(eq(products.id, p.id));
        inserted++;
      }
      continue;
    }
    await db.insert(products).values({
      id: p.id,
      sellerId,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category,
      brand: p.brand,
      price: p.price,
      compareAt: p.compareAt ?? null,
      rating: p.rating,
      stock: p.stock,
      image: p.image,
      badges: p.badges,
      sellerName: p.seller?.name ?? null,
      officialStore: p.seller?.officialStore ?? false,
      express: p.delivery?.express ?? false,
    });
    inserted++;
  }
  console.log(`products synced: ${inserted} insert/update(s) out of ${catalog.length}`);
}

async function main(): Promise<void> {
  await upsertDriver();
  const sellerId = await upsertSeller();
  await upsertCustomer();
  await seedProducts(sellerId);
  console.log("seed complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closeDb);
