// Paystack webhook: signature-verified, idempotent event handling.
// Payment fulfilment only happens on a NEW charge.success that Paystack's
// verify endpoint also confirms as successful for our stored amount.
import { Hono } from "hono";
import { getDb } from "../../db/index.js";
import { paystackEvents } from "../../db/schema.js";
import {
  PaystackWebhookPayload,
  paystackConfigured,
  verifyPaystackTransaction,
  verifyWebhookSignature,
} from "../../paystack/paystack.js";
import { markPaymentSuccess } from "../../fulfillment.js";

export const webhookRoutes = new Hono();

webhookRoutes.post("", async (context) => {
  const raw = await context.req.arrayBuffer();
  const signature = context.req.header("x-paystack-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return context.json({ error: "Invalid signature" }, 401);
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(Buffer.from(raw).toString("utf8")) as PaystackWebhookPayload;
  } catch {
    // Signed but unparseable body: nothing actionable, still acknowledge.
    return context.json({ status: "ignored" }, 200);
  }

  const reference = payload.data?.reference;
  const eventId = String(payload.data?.id ?? reference ?? "");
  if (!eventId) {
    return context.json({ status: "ignored" }, 200);
  }

  const result = await getDb()
    .insert(paystackEvents)
    .values({ id: eventId, payload: payload as unknown as Record<string, unknown> })
    .returning();
  if (result.length === 0) {
    // Duplicate delivery: already processed (or ignored) once.
    return context.json({ status: "duplicate" }, 200);
  }

  if (
    payload.event === "charge.success" &&
    payload.data?.status === "success" &&
    reference &&
    paystackConfigured()
  ) {
    const verified = await verifyPaystackTransaction(reference);
    if (verified.status === "success") {
      await markPaymentSuccess(reference);
    }
  }

  return context.json({ status: "ok" }, 200);
});
