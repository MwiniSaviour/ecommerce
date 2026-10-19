import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// MONEY CONVENTION: every amount column is GHS (same units the client uses).
// Paystack expects pesewas (kobo); conversion happens only at the Paystack
// boundary via Math.round(ghs * 100). All stored GHS totals in this demo are
// whole cedis, so doublePrecision is lossless here.

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull(), // "customer" | "seller" | "driver"
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  business: text("business"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(), // Tech | Home | Fashion | Beauty | Sports
    brand: text("brand").notNull(),
    price: doublePrecision("price").notNull(),
    compareAt: doublePrecision("compare_at"),
    rating: doublePrecision("rating").notNull(),
    stock: integer("stock").notNull(),
    image: text("image").notNull(),
    badges: jsonb("badges").$type<string[]>().notNull().default([]),
    sellerName: text("seller_name"),
    officialStore: boolean("official_store"),
    express: boolean("express"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_seller_idx").on(t.sellerId)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id").references(() => users.id, { onDelete: "set null" }),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    deliveryMethod: text("delivery_method").notNull(), // "delivery" | "pickup"
    address: jsonb("address").$type<Record<string, string> | null>(),
    paymentMethod: text("payment_method").notNull(), // "pod" | "momo" | "card"
    subtotal: doublePrecision("subtotal").notNull(),
    shipmentFee: doublePrecision("shipment_fee").notNull(),
    total: doublePrecision("total").notNull(),
    status: text("status").notNull().default("created"), // created | paid | fulfilled | cancelled
    // Seller fulfillment lifecycle, distinct from `status`:
    // pending -> ready-to-ship -> shipped -> returned/cancelled
    sellerStatus: text("seller_status").notNull().default("pending"),
    // Seller commission locked in at priceOrder time (0.25 of subtotal).
    commission: doublePrecision("commission").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_customer_idx").on(t.customerId)],
);

export const orderLines = pgTable(
  "order_lines",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    name: text("name").notNull(),
    image: text("image").notNull(),
    price: doublePrecision("price").notNull(), // server-resolved unit price
    quantity: integer("quantity").notNull(),
  },
  (t) => [index("order_lines_order_idx").on(t.orderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    method: text("method").notNull(), // "card" | "momo"
    reference: text("reference").notNull().unique(),
    authorizationUrl: text("authorization_url"),
    amountGhs: doublePrecision("amount_ghs").notNull(),
    status: text("status").notNull().default("initialized"), // initialized | success | failed
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("payments_order_idx").on(t.orderId)],
);

export const paystackEvents = pgTable("paystack_events", {
  id: text("id").primaryKey(), // Paystack event id; reseverts same id are no-ops
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderHistory = pgTable(
  "order_history",
  {
    id: serial("id").primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    label: text("label").notNull(),
  },
  (t) => [index("order_history_order_idx").on(t.orderId)],
);

export const driverProfiles = pgTable("driver_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("apply-form"), // apply-form | verification-pending | approved
  name: text("name"),
  phone: text("phone"),
  city: text("city"),
  vehicle: text("vehicle"),
  plate: text("plate"),
  license: text("license"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const driverTasks = pgTable(
  "driver_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    driverId: uuid("driver_id").references(() => users.id, { onDelete: "set null" }),
    // Originating order; null for ad-hoc hub tasks. Set at creation so a COD
    // delivery can flip order.status to "paid" with an orderHistory entry.
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    pickupName: text("pickup_name").notNull(),
    pickupAddress: text("pickup_address").notNull(),
    pickupHub: text("pickup_hub").notNull(),
    dropoffName: text("dropoff_name").notNull(),
    dropoffAddress: text("dropoff_address").notNull(),
    dropoffArea: text("dropoff_area").notNull(),
    customer: text("customer").notNull(),
    phone: text("phone").notNull(),
    payment: text("payment").notNull(), // prepaid | COD
    codAmount: doublePrecision("cod_amount"),
    itemsSummary: text("items_summary").notNull(),
    distanceKm: doublePrecision("distance_km").notNull(),
    etaMin: integer("eta_min").notNull(),
    earnings: doublePrecision("earnings").notNull(),
    status: text("status").notNull().default("offered"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("driver_tasks_driver_idx").on(t.driverId)],
);

export const driverTaskHistory = pgTable(
  "driver_task_history",
  {
    id: serial("id").primaryKey(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => driverTasks.id, { onDelete: "cascade" }),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    label: text("label").notNull(),
  },
  (t) => [index("driver_task_history_task_idx").on(t.taskId)],
);

// Friendlier import aliases defensively guard against the lint-unhelpful names.
export { unique };
