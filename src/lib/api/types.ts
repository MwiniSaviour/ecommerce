// Versioned api seam — surface-side types (Task 8 of 2026-10-18 plan).
// Domain types keep living at their original declaration sites; these are
// re-exports so adapter callers never import from feature modules directly.

export type { Product, ProductCategory, CategoryFilter } from "@/lib/products";
export type { CartItem } from "@/components/storefront-provider";
export type { SellerOrder, SellerOrderStatus, SellerOrderMethod } from "@/lib/seller-orders";
export type { SellerSession } from "@/lib/seller-auth";
export type { DriverProfile, DriverTask, DriverTaskStatus } from "@/lib/driver-tasks";
export type { StoredOrder, StoredOrderLine } from "@/components/checkout-view";

// Customer demo session: email-only, device-local.
export type AccountSession = { email: string } | null;

// One saved delivery address per device (kora-market-address-v1). Was
// StoredAddress inside src/app/account/addresses/page.tsx before the
// api-seam migration; every field is a non-empty string.
export type AccountAddress = {
  name: string;
  region: string;
  city: string;
  street: string;
  phone: string;
};
