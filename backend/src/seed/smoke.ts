// @ts-nocheck
/**
 * Idempotent API smoke test. Requires a running server (default :4001).
 *
 *   npm run seed
 *   npm run dev        # or: node dist/server.js
 *   npm run smoke
 *
 * Exits 0 only when every assertion passes.
 */

import "dotenv/config";
import pg from "pg";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:4001";

let failures = 0;

function check(name, cond, detail) {
  if (cond) {
    console.log(`  ok   ${name}`);
  } else {
    failures++;
    console.error(`  FAIL ${name}${detail ? ` — ${JSON.stringify(detail).slice(0, 400)}` : ""}`);
  }
}

async function req(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON (should not happen on this API)
  }
  return { status: res.status, body: json };
}

async function dbStatus(orderId) {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const { rows } = await pool.query("select status from orders where id = $1", [orderId]);
    return rows[0]?.status ?? null;
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log(`smoke: ${BASE}`);
  const health = await req("GET", "/health");
  check("health", health.status === 200 && health.body?.ok === true, health);

  // ----- auth: register / login / refresh / bad credentials -----
  const customer = {
    email: `smoke-${Date.now()}@smoke.test`,
    password: "SmokePass2026!",
    name: "Smoke Customer",
    role: "customer",
  };
  const reg = await req("POST", "/v1/auth/register", { body: customer });
  check(
    "register customer",
    reg.status === 201 &&
      typeof reg.body?.token === "string" &&
      typeof reg.body?.refreshToken === "string" &&
      reg.body?.user?.id,
    reg,
  );
  const custToken = reg.body.token;
  const custRefresh = reg.body.refreshToken;

  const ref = await req("POST", "/v1/auth/refresh", { body: { refreshToken: custRefresh } });
  check("refresh round-trip", ref.status === 200 && typeof ref.body?.token === "string", ref);

  const me = await req("GET", "/v1/auth/me", { token: custToken });
  check("me with token", me.status === 200 && me.body?.email === customer.email, me);

  const wrong = await req("POST", "/v1/auth/login", {
    body: { email: customer.email, password: "wrong-password" },
  });
  check("wrong password rejected", wrong.status === 401, wrong);

  const noauth = await req("GET", "/v1/auth/me");
  check("me without token rejected", noauth.status === 401, noauth);

  // ----- products -----
  const products = await req("GET", "/v1/products");
  check(
    "products list",
    products.status === 200 &&
      Array.isArray(products.body?.products) &&
      products.body.products.length >= 2,
    products,
  );
  const first = products.body.products[0];
  const bySlug = await req("GET", `/v1/products/${encodeURIComponent(first.slug)}`);
  check("product by slug", bySlug.status === 200 && bySlug.body?.id === first.id, bySlug);

  // ----- checkout draft -----
  const draft = await req("POST", "/v1/checkout/draft", {
    token: custToken,
    body: { items: [{ id: first.id, quantity: 2 }] },
  });
  check(
    "draft pricing",
    draft.status === 200 &&
      typeof draft.body?.subtotal === "number" &&
      typeof draft.body?.total === "number" &&
      draft.body.total > draft.body.subtotal,
    draft,
  );

  // ----- prepaid card order + mock payment -----
  const card = await req("POST", "/v1/checkout/orders", {
    token: custToken,
    body: {
      items: [{ id: first.id, quantity: 2 }],
      contact: { email: customer.email, phone: "+233201234567" },
      deliveryMethod: "delivery",
      address: { label: "Home", line1: "12 Smoke Street", area: "Test-Accra", city: "Accra" },
      paymentMethod: "card",
    },
  });
  check(
    "card order created",
    card.status === 201 && card.body?.order?.id && typeof card.body?.reference === "string",
    card,
  );
  const cardRef = card.body.reference;

  const mockPay = await req("POST", `/v1/checkout/mock-paid/${cardRef}`);
  check(
    "mock payment success",
    mockPay.status === 200 && mockPay.body?.status === "success",
    mockPay,
  );

  // Replay is idempotent: the order comes back unchanged, no duplicate task.
  const mockReplay = await req("POST", `/v1/checkout/mock-paid/${cardRef}`);
  check(
    "mock payment replay idempotent",
    mockReplay.status === 200 && mockReplay.body?.order?.id === card.body.order.id,
    mockReplay,
  );

  // ----- COD order (cash on delivery, still a delivery-method order so the
  // backend creates a driver task — pickup orders never get tasks) -----
  const pod = await req("POST", "/v1/checkout/orders", {
    token: custToken,
    body: {
      items: [{ id: first.id, quantity: 1 }],
      contact: { email: customer.email, phone: "+233201234567" },
      deliveryMethod: "delivery",
      address: { label: "Home", line1: "12 Smoke Street", area: "Test-Accra", city: "Accra" },
      paymentMethod: "pod",
    },
  });
  check("cod order created", pod.status === 201 && pod.body?.order?.id, pod);

  const custOrders = await req("GET", "/v1/orders", { token: custToken });
  const custOrderIds = new Set(
    (Array.isArray(custOrders.body) ? custOrders.body : []).map((o) => o.id),
  );
  check(
    "customer order history",
    custOrders.status === 200 &&
      Array.isArray(custOrders.body) &&
      custOrderIds.has(card.body.order.id) &&
      custOrderIds.has(pod.body.order.id),
    custOrders,
  );

  // ----- seller flow -----
  const sellerLogin = await req("POST", "/v1/auth/login", {
    body: { email: "aries@koravendorhub.com", password: "KoraDemo2026" },
  });
  check("seller login", sellerLogin.status === 200 && sellerLogin.body?.token, sellerLogin);
  const sellerToken = sellerLogin.body.token;

  const sellerOrders = await req("GET", "/v1/seller/orders", { token: sellerToken });
  const sellerList = Array.isArray(sellerOrders.body) ? sellerOrders.body : [];
  check(
    "seller sees scoped orders",
    sellerOrders.status === 200 && sellerList.length > 0 && Array.isArray(sellerList[0].items),
    sellerOrders,
  );
  const soldOrderId = sellerList.find((o) => o.id === card.body.order.id)?.id ?? sellerList[0].id;

  const ledger = await req("GET", "/v1/seller/ledger", { token: sellerToken });
  check(
    "seller ledger",
    ledger.status === 200 &&
      Array.isArray(ledger.body) &&
      ledger.body.every((e) => typeof e.gross === "number" && typeof e.net === "number"),
    ledger,
  );

  const ready = await req("PATCH", `/v1/seller/orders/${soldOrderId}`, {
    token: sellerToken,
    body: { action: "ready-to-ship" },
  });
  check(
    "seller ready-to-ship",
    ready.status === 200 && ready.body?.status === "ready-to-ship",
    ready,
  );

  // Cancel is allowed from "pending"/"ready-to-ship" (seller.ts TRANSITIONS),
  // so prove the guard on a throwaway order instead of the paid card order.
  const throwaway = await req("POST", "/v1/checkout/orders", {
    token: custToken,
    body: {
      items: [{ id: first.id, quantity: 1 }],
      contact: { email: customer.email, phone: "+233201234567" },
      deliveryMethod: "pickup",
      paymentMethod: "pod",
    },
  });
  check("throwaway order created", throwaway.status === 201 && throwaway.body?.order?.id, throwaway);

  const cancelFirst = await req("PATCH", `/v1/seller/orders/${throwaway.body.order.id}`, {
    token: sellerToken,
    body: { action: "cancel" },
  });
  check(
    "cancel allowed from pending",
    cancelFirst.status === 200 && cancelFirst.body?.status === "cancelled",
    cancelFirst,
  );
  const cancelAgain = await req("PATCH", `/v1/seller/orders/${throwaway.body.order.id}`, {
    token: sellerToken,
    body: { action: "cancel" },
  });
  check("double cancel blocked", cancelAgain.status === 409, cancelAgain);

  // ----- driver flow -----
  const driverLogin = await req("POST", "/v1/auth/login", {
    body: { email: "kwame@koraexpress.test", password: "DriverDemo2026" },
  });
  check("driver login", driverLogin.status === 200 && driverLogin.body?.token, driverLogin);
  const driverToken = driverLogin.body.token;

  const profile0 = await req("GET", "/v1/driver/profile", { token: driverToken });
  check("driver profile readable", profile0.status === 200 && profile0.body, profile0);

  const profilePut = await req("PUT", "/v1/driver/profile", {
    token: driverToken,
    body: {
      name: "Kwame Smoke",
      phone: "+233555000111",
      city: "Kumasi",
      vehicle: "motorbike",
      plate: "SM-123-26",
      license: "LIC-SMOKE-1",
    },
  });
  check("driver profile upsert", profilePut.status === 200, profilePut);

  const tasks = await req("GET", "/v1/driver/tasks", { token: driverToken });
  const taskList = Array.isArray(tasks.body) ? tasks.body : [];
  check("driver tasks visible", tasks.status === 200 && taskList.length >= 2, tasks);
  // Tasks scoped to this run: dropoff name falls back to the order contact
  // email, which is unique per run, so stale tasks from earlier runs never match.
  const mine = taskList.filter((t) => t.dropoff?.name === customer.email);
  const codTask = mine.find((t) => t.payment === "COD");
  const prepaidTask = mine.find((t) => t.payment === "prepaid");
  check("both task kinds present", !!codTask && !!prepaidTask, mine);

  const noauthPatch = await req("PATCH", `/v1/driver/tasks/${codTask.id}`, {
    body: { action: "accept" },
  });
  check("driver patch needs auth", noauthPatch.status === 401, noauthPatch);

  for (const action of ["accept", "pick-up", "en-route", "deliver"]) {
    const r = await req("PATCH", `/v1/driver/tasks/${codTask.id}`, {
      token: driverToken,
      body: { action },
    });
    check(`COD task ${action}`, r.status === 200 && typeof r.body?.id === "string", r);
  }

  for (const action of ["accept", "pick-up", "en-route"]) {
    const r = await req("PATCH", `/v1/driver/tasks/${prepaidTask.id}`, {
      token: driverToken,
      body: { action },
    });
    check(`prepaid task ${action}`, r.status === 200 && typeof r.body?.id === "string", r);
  }
  // Once en-route the state guard passes and reason validation can fire.
  const badReason = await req("PATCH", `/v1/driver/tasks/${prepaidTask.id}`, {
    token: driverToken,
    body: { action: "fail", reason: "made this up" },
  });
  check("fail reason validated", badReason.status === 400, badReason);
  const fail = await req("PATCH", `/v1/driver/tasks/${prepaidTask.id}`, {
    token: driverToken,
    body: { action: "fail", reason: "Package damaged" },
  });
  check(
    "prepaid task fail with reason",
    fail.status === 200 && fail.body?.status === "failed",
    fail,
  );

  // COD deliver flips the originating POD order to "paid" (DB-level check:
  // customer/seller serializers deliberately omit raw order status).
  const podStatus = await dbStatus(pod.body.order.id);
  const cardStatus = await dbStatus(card.body.order.id);
  check("COD delivery marks order paid", podStatus === "paid", { podStatus });
  check("prepaid mock-paid marks order paid", cardStatus === "paid", { cardStatus });

  console.log(failures === 0 ? "\nSMOKE PASS" : `\nSMOKE FAIL (${failures})`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("smoke crashed:", error);
  process.exit(1);
});
