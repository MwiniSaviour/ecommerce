// Pricing mirrors src/components/cart-fees.ts + src/lib/seller-orders.ts.
import type { products } from "./db/schema.js";

type ProductRow = typeof products.$inferSelect;

export const STANDARD_SHIPMENT_FEE = 25;
export const EXPRESS_SHIPMENT_FEE = 20;
export const SELLER_COMMISSION_RATE = 0.25;

export type CartRef = { id: string; quantity: number };

export function computePriceOrder(
  refs: CartRef[],
  byId: Map<string, ProductRow>,
): { subtotal: number; shipmentFee: number; commission: number; total: number; missing: string[] } {
  let subtotal = 0;
  const missing: string[] = [];
  let hasExpress = false;
  for (const ref of refs) {
    const p = byId.get(ref.id);
    if (!p || !p.active) {
      missing.push(ref.id);
      continue;
    }
    if (p.express) hasExpress = true;
    subtotal += p.price * ref.quantity;
  }
  subtotal = Math.round(subtotal);
  const shipmentFee =
    refs.length > 0 && missing.length === 0
      ? hasExpress
        ? Math.min(STANDARD_SHIPMENT_FEE, EXPRESS_SHIPMENT_FEE)
        : STANDARD_SHIPMENT_FEE
      : 0;
  // Client math: customer total = subtotal + shipmentFee (checkout-view.tsx:86);
  // commission is the seller ledger cut, never charged to the customer.
  const commission = Math.round(subtotal * SELLER_COMMISSION_RATE);
  return {
    subtotal,
    shipmentFee,
    commission,
    total: subtotal + shipmentFee,
    missing,
  };
}

// Pesewa helper used only at the Paystack boundary.
export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}
