// One-shot generator: mirrors the storefront catalog into src/seed/catalog.ts.
// Usage (from backend/): npx tsx scripts/gen-catalog.ts
import { readFileSync, writeFileSync } from "node:fs";
import { products } from "../../src/lib/products";

type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  compareAt?: number | null;
  rating: number;
  stock: number;
  image: string;
  badges: string[];
  seller?: { name: string; officialStore?: boolean } | null;
  delivery?: { express?: boolean } | null;
};

const catalog: CatalogProduct[] = products.map((p) => ({
  id: p.id,
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
  seller: p.seller ?? null,
  delivery: p.delivery ?? null,
}));

writeFileSync(
  "src/seed/catalog.ts",
  `// AUTO-GENERATED from ../src/lib/products.ts — do not edit by hand.\n` +
    `// Regenerate: npx tsx scripts/gen-catalog.ts (run from backend/).\n\n` +
    `export type CatalogProduct = {\n  id: string;\n  slug: string;\n  name: string;\n  description: string;\n  category: string;\n  brand: string;\n  price: number;\n  compareAt?: number | null;\n  rating: number;\n  stock: number;\n  image: string;\n  badges: string[];\n  seller?: { name: string; officialStore?: boolean } | null;\n  delivery?: { express?: boolean } | null;\n};\n\n` +
    `export const catalog: CatalogProduct[] = ${JSON.stringify(catalog, null, 2)};\n`,
);
console.log(`wrote src/seed/catalog.ts with ${catalog.length} products`);
