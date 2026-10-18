import { getProductById } from "@/lib/products";

export const STANDARD_SHIPMENT_FEE = 25;
export const EXPRESS_SHIPMENT_FEE = 20;

export type CartItemRef = { id: string; quantity: number };

export function cartHasExpressDelivery(items: readonly CartItemRef[]): boolean {
  return items.some((item) => getProductById(item.id)?.delivery?.express === true);
}

export function shipmentFeeForItems(items: readonly CartItemRef[]): number {
  return cartHasExpressDelivery(items) ? EXPRESS_SHIPMENT_FEE : STANDARD_SHIPMENT_FEE;
}
