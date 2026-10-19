// Standalone API server: all v1 routes mounted under /v1, CORS for the Expo
// web app on localhost:3001. Loads the root .env when cwd is backend/.
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/v1/auth.js";
import { productRoutes } from "./routes/v1/products.js";
import { checkoutRoutes } from "./routes/v1/checkout.js";
import { webhookRoutes } from "./routes/v1/webhook.js";
import { ordersRoutes } from "./routes/v1/orders.js";
import { sellerRoutes } from "./routes/v1/seller.js";
import { driverRoutes } from "./routes/v1/driver.js";
import { closeDb } from "./db/index.js";

const app = new Hono();

app.use("*", cors({ origin: ["http://localhost:3001"], credentials: true }));

app.get("/health", (context) => context.json({ ok: true }));

app.route("/v1/auth", authRoutes);
app.route("/v1/products", productRoutes);
app.route("/v1/checkout", checkoutRoutes);
app.route("/v1/paystack/webhook", webhookRoutes);
app.route("/v1/orders", ordersRoutes);
app.route("/v1/seller", sellerRoutes);
app.route("/v1/driver", driverRoutes);

const port = Number(process.env.PORT ?? 4001);
const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`kora api listening on http://localhost:${info.port}`);
});

// pg pool is a resource: close it on shutdown so Postgres doesn't accumulate
// stale sockets across dev restarts.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close();
    void closeDb();
    process.exit(0);
  });
}
