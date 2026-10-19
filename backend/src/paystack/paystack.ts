import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";

// All amounts cross this boundary in pesewas (GHS * 100). Server recomputes
// amounts from orders.total; stored GHS are whole cedis.

export function paystackKey(): string {
  return (process.env.PAYSTACK_SECRET_KEY ?? "").trim();
}

export function paystackConfigured(): boolean {
  return paystackKey().startsWith("sk_");
}

export function newReference(): string {
  return `KOR-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

const API_ROOT = "https://api.paystack.co";

export type PaystackInit = { status: boolean; message: string; authorizationUrl: string | null };

export async function initPaystackTransaction(opts: {
  amountPesewas: number;
  email: string;
  reference: string;
}): Promise<PaystackInit> {
  const response = await fetch(`${API_ROOT}/transaction/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${paystackKey()}`,
    },
    body: JSON.stringify({
      amount: opts.amountPesewas,
      email: opts.email,
      currency: "GHS",
      reference: opts.reference,
      callback_url: process.env.KORA_FRONTEND_URL
        ? `${process.env.KORA_FRONTEND_URL}/checkout/success`
        : undefined,
    }),
  });
  const body = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };
  if (body.status && body.data?.authorization_url) {
    return { status: true, message: body.message ?? "initialized", authorizationUrl: body.data.authorization_url };
  }
  return { status: false, message: body.message ?? "Paystack initialize failed", authorizationUrl: null };
}

export type PaystackVerify = { status: string; amountPesewas: number | null; message: string };

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerify> {
  const response = await fetch(`${API_ROOT}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackKey()}` },
  });
  const body = (await response.json()) as {
    message?: string;
    data?: { status?: string; amount?: number };
  };
  if (!body.data) {
    return { status: "unknown", amountPesewas: null, message: body.message ?? "verify failed" };
  }
  return {
    status: body.data.status ?? "unknown",
    amountPesewas: typeof body.data.amount === "number" ? body.data.amount : null,
    message: body.message ?? "",
  };
}

// HMAC-SHA512(PAYSTACK_SECRET_KEY, rawBody) matches x-paystack-signature.
export function verifyWebhookSignature(rawBody: ArrayBuffer, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", paystackKey()).update(Buffer.from(rawBody)).digest("hex");
  const provided = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return provided.length === expectedBuffer.length && timingSafeEqual(provided, expectedBuffer);
}

export type PaystackWebhookPayload = {
  event?: string;
  data?: { reference?: string; status?: string; amount?: number; id?: number | string };
};
