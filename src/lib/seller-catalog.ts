// DESIGN DIRECTION: seller catalog import — inspired by Jumia seller bulk CSV import with in-progress/failed/finished states; not Jumia-verified.

import { useCallback, useSyncExternalStore } from "react";

import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";
import { sellerNowMs } from "@/lib/seller-orders";
import { sellerProducts, type SellerProduct } from "@/lib/seller-products";

export const SELLER_CATALOG_OVERRIDES_KEY = "kora-market-seller-catalog-overrides-v1";
export const SELLER_IMPORTS_KEY = "kora-market-seller-imports-v1";

export type SellerProductStatus = "active" | "inactive";

export type CatalogOverride = {
  price?: number;
  stock?: number;
  status?: SellerProductStatus;
};

export type CatalogRow = SellerProduct & {
  activePrice: number;
  activeStock: number;
  activeStatus: SellerProductStatus;
  overridden: boolean;
};

export type SellerImport = {
  id: string;
  createdAt: string;
  fileName: string;
  rowsCompleted: number;
  rowsFailed: number;
  status: "in-progress" | "finished" | "failed";
};

export type SellerImportRow = {
  sku: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  status: SellerImportSheetStatus;
  imageUrl: string;
  valid: boolean;
  reason: string | null;
};

export type SellerImportSheetStatus = "active" | "inactive";

type SellerOverrideMap = Record<string, CatalogOverride>;

function isSellerOverride(entry: unknown): entry is SellerOverrideMap {
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return false;
  for (const value of Object.values(entry)) {
    if (typeof value !== "object" || value === null) return false;
    for (const field of Object.values(value as Record<string, unknown>)) {
      if (field !== undefined && typeof field !== "number" && typeof field !== "string") return false;
    }
  }
  return true;
}

function parseOverrides(raw: string | null): SellerOverrideMap | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSellerOverride(parsed) ? (parsed as SellerOverrideMap) : null;
  } catch {
    return null;
  }
}

function browserSellerOverrides(): SellerOverrideMap {
  return parseOverrides(readStorageRaw(SELLER_CATALOG_OVERRIDES_KEY)) ?? {};
}

export function readSellerCatalogOverrides(): SellerOverrideMap {
  if (typeof window === "undefined") return {};
  return browserSellerOverrides();
}

export function saveSellerCatalogOverride(productId: string, override: CatalogOverride): void {
  writeStorage(
    SELLER_CATALOG_OVERRIDES_KEY,
    JSON.stringify({ ...browserSellerOverrides(), [productId]: override }),
  );
}

export function useSellerCatalogOverrides(): SellerOverrideMap {
  const raw = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SELLER_CATALOG_OVERRIDES_KEY, onStoreChange),
    () => readStorageRaw(SELLER_CATALOG_OVERRIDES_KEY),
    () => null,
  );
  return raw ? (parseOverrides(raw) ?? {}) : {};
}

export function useSellerImports(): SellerImport[] {
  const raw = useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SELLER_IMPORTS_KEY, onStoreChange),
    () => readStorageRaw(SELLER_IMPORTS_KEY),
    () => null,
  );
  return raw ? (parseImports(raw) ?? []) : [];
}

export function buildCatalogRows(overrides: SellerOverrideMap): CatalogRow[] {
  return sellerProducts.map((product) => {
    const override = overrides[product.id];
    return {
      ...product,
      activePrice: typeof override?.price === "number" ? override.price : product.price,
      activeStock: typeof override?.stock === "number" ? override.stock : product.stock,
      activeStatus: override?.status ?? "active",
      overridden: override !== undefined,
    };
  });
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export const IMPORT_TEMPLATE_CSV = [
  "sku,name,brand,price,quantity,status,image-url",
  ...sellerProducts.map((product) =>
    [product.sku, csvEscape(product.name), csvEscape(product.brand), String(product.price), String(product.stock), "active", product.image].join(","),
  ),
].join("\n");

export function parseSellerCsv(text: string): { rows: SellerImportRow[]; error: string | null } {
  const lines = text.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { rows: [], error: "The file needs a header row plus at least one product row." };
  const header = lines[0]?.split(",").map((column) => column.trim().toLowerCase()) ?? [];
  const expected = ["sku", "name", "brand", "price", "quantity", "status", "image-url"];
  if (expected.some((column) => !header.includes(column))) {
    return { rows: [], error: "Missing columns. Use the template header: sku, name, brand, price, quantity, status, image-url." };
  }
  const columnIndex = (name: string) => header.indexOf(name);
  const rows: SellerImportRow[] = lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    const rawPrice = Number(cells[columnIndex("price")] ?? NaN);
    const rawQuantity = Number(cells[columnIndex("quantity")] ?? NaN);
    const statusValue = cells[columnIndex("status")] ?? "";
    const validStatus = statusValue === "active" || statusValue === "inactive";
    let reason: string | null = null;
    if (!(cells[columnIndex("sku")] ?? "").startsWith("KOR-SKU-")) reason = "SKU must match the store template";
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) reason = "Price must be a number greater than zero";
    if (!Number.isInteger(rawQuantity) || rawQuantity < 0) reason = "Quantity must be a whole number of 0 or more";
    if (!validStatus) reason = "Status must be active or inactive";
    return {
      sku: cells[columnIndex("sku")] ?? "",
      name: cells[columnIndex("name")] ?? "",
      brand: cells[columnIndex("brand")] ?? "",
      price: Number.isFinite(rawPrice) ? rawPrice : 0,
      quantity: Number.isInteger(rawQuantity) ? rawQuantity : 0,
      status: validStatus ? (statusValue as SellerImportSheetStatus) : "active",
      imageUrl: cells[columnIndex("image-url")] ?? "",
      valid: reason === null,
      reason,
    };
  });
  return { rows, error: null };
}

function isSellerImport(entry: unknown): entry is SellerImport {
  if (typeof entry !== "object" || entry === null) return false;
  const sellerImport = entry as Partial<SellerImport>;
  return (
    typeof sellerImport.id === "string" &&
    typeof sellerImport.createdAt === "string" &&
    typeof sellerImport.fileName === "string" &&
    typeof sellerImport.rowsCompleted === "number" &&
    typeof sellerImport.rowsFailed === "number" &&
    typeof sellerImport.status === "string"
  );
}

function isSellerImportList(entry: unknown): entry is SellerImport[] {
  return Array.isArray(entry) && entry.every(isSellerImport);
}

function parseImports(raw: string | null): SellerImport[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSellerImportList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function browserSellerImports(): SellerImport[] {
  return parseImports(readStorageRaw(SELLER_IMPORTS_KEY)) ?? [];
}

export function readSellerImports(): SellerImport[] {
  if (typeof window === "undefined") return [];
  return parseImports(readStorageRaw(SELLER_IMPORTS_KEY)) ?? [];
}

export function updateSellerImports(updater: (imports: SellerImport[]) => SellerImport[]): void {
  const next = updater(browserSellerImports());
  if (next.length > 0) writeStorage(SELLER_IMPORTS_KEY, JSON.stringify(next));
}

export function useSellerImportActions(): {
  finishImport: (importId: string) => void;
} {
  const finishImport = useCallback((importId: string) => {
    writeStorage(
      SELLER_IMPORTS_KEY,
      JSON.stringify(
        browserSellerImports().map((entry) => (entry.id === importId ? { ...entry, status: "finished" as const } : entry)),
      ),
    );
  }, []);
  return { finishImport };
}

export function createSellerImport(fileName: string, rows: SellerImportRow[]): SellerImport {
  const rowsCompleted = rows.filter((row) => row.valid).length;
  const rowsFailed = rows.length - rowsCompleted;
  return {
    id: `KIM-${5300 + readSellerImports().length + 1}`,
    createdAt: new Date(sellerNowMs()).toISOString(),
    fileName,
    rowsCompleted,
    rowsFailed,
    status: rowsCompleted === 0 ? "failed" : "in-progress",
  };
}

export function recordSellerImport(entry: SellerImport): void {
  updateSellerImports((imports) => [entry, ...imports]);
}
