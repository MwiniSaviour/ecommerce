// Driver onboarding and fulfillment lifecycle: profile, the offered/claimed
// task feed, and the delivery status transitions. Labels mirror
// src/lib/driver-tasks.ts (history.at is epoch ms on the client).
import { Hono } from "hono";
import { z } from "zod";
import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import {
  driverProfiles,
  driverTaskHistory,
  driverTasks,
  orderHistory,
  orders,
} from "../../db/schema.js";
import { taskToDriver } from "../../serialize.js";
import { requireAuth, requireRole, type AuthUser } from "../../auth/jwt.js";

export const driverRoutes = new Hono<{ Variables: { authUser: AuthUser } }>();

driverRoutes.use("*", requireAuth, requireRole("driver"));

const defaultProfile = {
  status: "apply-form",
  name: "",
  phone: "",
  city: "Accra",
  vehicle: "Motorbike",
  plate: "",
  license: "",
  submittedAt: 0,
  approvedAt: null,
};

function profileToClient(row: typeof driverProfiles.$inferSelect) {
  return {
    status: row.status as "apply-form" | "verification-pending" | "approved",
    name: row.name ?? "",
    phone: row.phone ?? "",
    city: row.city ?? "Accra",
    vehicle: row.vehicle ?? "Motorbike",
    plate: row.plate ?? "",
    license: row.license ?? "",
    submittedAt: row.submittedAt ? row.submittedAt.getTime() : 0,
    approvedAt: row.approvedAt ? row.approvedAt.getTime() : null,
  };
}

driverRoutes.get("/profile", async (context) => {
  const driver = context.get("authUser");
  const [row] = await getDb()
    .select()
    .from(driverProfiles)
    .where(eq(driverProfiles.userId, driver.id))
    .limit(1);
  return context.json(row ? profileToClient(row) : defaultProfile);
});

const profileSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(1).max(40),
  city: z.string().min(1).max(80),
  vehicle: z.string().min(1).max(80),
  plate: z.string().min(1).max(40),
  license: z.string().min(1).max(40),
});

driverRoutes.put("/profile", async (context) => {
  const driver = context.get("authUser");
  const parsed = profileSchema.safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: "Invalid request" }, 400);
  }
  const data = parsed.data;
  const db = getDb();
  const now = new Date();

  const [existing] = await db
    .select()
    .from(driverProfiles)
    .where(eq(driverProfiles.userId, driver.id))
    .limit(1);
  // Resubmitting re-enters verification unless the profile was already approved.
  const nextStatus =
    existing?.status === "approved" ? "approved" : "verification-pending";

  const [row] = await db
    .insert(driverProfiles)
    .values({
      userId: driver.id,
      status: nextStatus,
      name: data.name,
      phone: data.phone,
      city: data.city,
      vehicle: data.vehicle,
      plate: data.plate,
      license: data.license,
      submittedAt: now,
      approvedAt: nextStatus === "approved" ? (existing?.approvedAt ?? null) : null,
    })
    .onConflictDoUpdate({
      target: driverProfiles.userId,
      set: {
        status: nextStatus,
        name: data.name,
        phone: data.phone,
        city: data.city,
        vehicle: data.vehicle,
        plate: data.plate,
        license: data.license,
        submittedAt: now,
        ...(nextStatus === "approved"
          ? { approvedAt: existing?.approvedAt ?? null }
          : { approvedAt: null }),
      },
    })
    .returning();

  return context.json(profileToClient(row));
});

// Tasks visible to this driver: everything claimed by them plus all
// unclaimed offers.
driverRoutes.get("/tasks", async (context) => {
  const driver = context.get("authUser");
  const db = getDb();
  const rows = await db
    .select()
    .from(driverTasks)
    .where(
      or(
        eq(driverTasks.driverId, driver.id),
        and(isNull(driverTasks.driverId), eq(driverTasks.status, "offered")),
      ),
    );
  if (rows.length === 0) return context.json([]);

  const historyRows = await db
    .select()
    .from(driverTaskHistory)
    .where(inArray(driverTaskHistory.taskId, rows.map((row) => row.id)))
    .orderBy(asc(driverTaskHistory.at));

  const historyByTask = new Map<string, { at: Date; label: string }[]>();
  for (const row of historyRows) {
    let list = historyByTask.get(row.taskId);
    if (!list) {
      list = [];
      historyByTask.set(row.taskId, list);
    }
    list.push({ at: row.at, label: row.label });
  }

  // Client sorts newest-first by the last history entry's timestamp.
  const serialized = rows.map((row) => ({
    row,
    lastAt: historyByTask.get(row.id)?.slice(-1)[0]?.at.getTime() ?? 0,
    client: taskToDriver(row, historyByTask.get(row.id) ?? []),
  }));
  serialized.sort((a, b) => b.lastAt - a.lastAt);
  return context.json(serialized.map((entry) => entry.client));
});

type DriverTaskRow = typeof driverTasks.$inferSelect;

const TRANSITIONS: Record<
  string,
  { from: string[]; to: string; label: (task: DriverTaskRow) => string }
> = {
  accept: {
    from: ["offered"],
    to: "accepted",
    label: () => "Task accepted",
  },
  "pick-up": {
    from: ["accepted"],
    to: "picked-up",
    label: (task) => `Package picked up at ${task.pickupHub}`,
  },
  "en-route": {
    from: ["picked-up"],
    to: "en-route",
    label: () => "En route to dropoff",
  },
  deliver: {
    from: ["en-route"],
    to: "delivered",
    label: () => "Delivered — proof of delivery confirmed",
  },
  // The fail label needs the request's reason, so PATCH builds it inline;
  // this entry only exists so the transition table stays exhaustive.
  fail: {
    from: ["en-route"],
    to: "failed",
    label: () => "Delivery failed",
  },
  return: { from: ["failed"], to: "returned", label: () => "Package returned to hub" },
};

driverRoutes.patch("/tasks/:id", async (context) => {
  const driver = context.get("authUser");
  const taskId = context.req.param("id");
  const parsed = z
    .object({
      action: z.enum(["accept", "pick-up", "en-route", "deliver", "fail", "return"]),
      reason: z.string().max(120).optional(),
    })
    .safeParse(await context.req.json());
  if (!parsed.success) {
    return context.json({ error: "Invalid request" }, 400);
  }
  const action = parsed.data.action;
  const transition = TRANSITIONS[action];
  if (!transition) {
    return context.json({ error: "Invalid request" }, 400);
  }
  const db = getDb();

  // Visibility: claimed by this driver, or an unclaimed offer they can accept.
  const [task] = await db
    .select()
    .from(driverTasks)
    .where(
      and(
        eq(driverTasks.id, taskId),
        or(
          eq(driverTasks.driverId, driver.id),
          and(isNull(driverTasks.driverId), eq(driverTasks.status, "offered")),
        ),
      ),
    )
    .limit(1);
  if (!task) {
    return context.json({ error: "Task not found" }, 404);
  }
  if (!transition.from.includes(task.status)) {
    return context.json(
      { error: `Cannot ${action} a task in "${task.status}"` },
      409,
    );
  }

  const reason =
    action === "fail" ? (parsed.data.reason ?? "").trim() : "";
  if (action === "fail" && !FAILED_DELIVERY_REASONS.includes(reason as never)) {
    return context.json({ error: "Invalid request" }, 400);
  }

  const label =
    action === "fail"
      ? `Delivery failed — ${reason}. Package returned to hub.`
      : transition.label(task);
  const now = new Date();

  // Accepting claims an unclaimed offer.
  await db
    .update(driverTasks)
    .set({
      status: transition.to,
      ...(action === "accept" ? { driverId: driver.id } : {}),
    })
    .where(eq(driverTasks.id, taskId));
  await db.insert(driverTaskHistory).values({ taskId, at: now, label });

  // A delivered COD delivery collects the cash: flip the originating order
  // to "paid" (idempotent) so the customer's dashboard reflects payment.
  if (action === "deliver" && task.payment === "COD" && task.orderId) {
    const [order] = await db
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, task.orderId))
      .limit(1);
    if (order && order.status !== "paid") {
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
      await db
        .insert(orderHistory)
        .values({ orderId: order.id, at: now, label: "Cash collected on delivery" });
    }
  }

  const historyRows = await historyByTaskFor(taskId);
  return context.json(
    taskToDriver({ ...task, status: transition.to }, [
      ...historyRows,
      { at: now, label },
    ]),
  );
});

// Small helper so PATCH can echo the full history it just appended to.
function historyByTaskFor(taskId: string) {
  const db = getDb();
  return db
    .select({ at: driverTaskHistory.at, label: driverTaskHistory.label })
    .from(driverTaskHistory)
    .where(eq(driverTaskHistory.taskId, taskId))
    .orderBy(asc(driverTaskHistory.at));
}

const FAILED_DELIVERY_REASONS = [
  "Customer unreachable",
  "No answer at door",
  "Address not found",
  "Address inaccessible",
  "Customer refused delivery",
  "Package damaged",
];
