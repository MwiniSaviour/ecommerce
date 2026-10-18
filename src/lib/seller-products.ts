import { products, type Product } from "@/lib/products";

// DESIGN DIRECTION: Aries & Co. Phones catalog — inspired by Jumia seller
// hub's inventory grid with SKU, stock and 30-day sales columns; not
// Jumia-verified.
export type SellerProduct = Product & {
  sku: string;
  bookedQty: number;
  sold30d: number;
  weight: number;
  variants: string[];
};

const variantSets: string[][] = [
  ["Black", "Sand"],
  ["128GB — Midnight"],
  ["8GB / 256GB"],
  ["UK 8", "UK 9", "UK 10"],
  ["Tan"],
  ["Duo"],
  ["Silver", "Rose gold"],
  ["1.2L"],
];

export const sellerProducts: SellerProduct[] = products.map((product, index) => ({
  ...product,
  sku: `KOR-SKU-${String(index + 1).padStart(4, "0")}`,
  bookedQty: 3 + ((index * 7) % 12),
  sold30d: 8 + ((index * 13) % 21),
  weight: Number((0.4 + 0.1 * ((index * 5) % 26)).toFixed(2)),
  variants: variantSets[index] ?? ["Default"],
}));

export function getSellerProductById(id: string): SellerProduct | undefined {
  return sellerProducts.find((product) => product.id === id);
}
