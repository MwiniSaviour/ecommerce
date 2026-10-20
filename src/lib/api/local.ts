// Versioned api seam — local adapter (Task 8 of 2026-10-18 plan).
// Thin wrappers over the seeded localStorage modules and the storage
// primitives in @/lib/local-store. Kept async so the http adapter in
// http.ts can implement the identical signatures against a backend.
// Client callers migrate onto this seam in waves; the last direct
// localStorage callers (storefront-provider, addresses page) moved across
// in the 2026-10-19 wave.

"use client";

import type {
  AccountAddress,
  AccountSession,
  CartItem,
  DriverProfile,
  DriverTask,
  Product,
  SellerOrder,
  SellerSession,
  StoredOrder,
} from "./types";
import { getProductById, getProductBySlug, discountedProducts, products } from "@/lib/products";
import {
  SELLER_AUTH_KEY,
  parseSellerSession,
  setSellerSession as writeSellerSession,
  clearSellerSession as wipeSellerSession,
} from "@/lib/seller-auth";
import { readSellerOrders, saveSellerOrders } from "@/lib/seller-orders";
import {
  DRIVER_PROFILE_KEY,
  DRIVER_AVAILABILITY_KEY,
  clearDriverData as wipeDriverData,
  getDriverAvailability as readDriverAvailability,
  getDriverProfile,
  getDriverTasks as readDriverTasks,
  parseDriverAvailability,
  parseDriverProfile,
  saveDriverTasks as storeDriverTasks,
  writeDriverAvailability as writeDriverAvailabilityRaw,
  writeDriverProfile,
} from "@/lib/driver-tasks";
import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";

// Storage keys owned by this adapter. The storefront provider and the
// address page used to hold their own copies of the cart, saved, and
// address literals; after the api-seam migration this module is the
// sole owner, so every version of the entry name lives here.
const CART_KEY = "kora-market-cart-v1";
const SAVED_KEY = "kora-market-saved-v1";
// ADDRESS_KEY keeps writing the same kora-market-address-v1 entry the
// address page wrote directly before its migration, so previously saved
// addresses still load.
const ADDRESS_KEY = "kora-market-address-v1";

// ORDERS_STORAGE_KEY is the customer-order journal; checkout-view no
// longer keeps its own copy of the literal (api-seam migration).
const ORDERS_STORAGE_KEY = "kora-market-orders-v1";

// ACCOUNT_SESSION_KEY is the customer demo session written by
// src/components/account-auth-panel.tsx (kora-market-auth-v1).
const ACCOUNT_SESSION_KEY = "kora-market-auth-v1";

export const productsApi = {
  async list(): Promise<Product[]> {
    return products;
  },
  async get(id: string): Promise<Product | undefined> {
    return getProductById(id);
  },
  async bySlug(slug: string): Promise<Product | undefined> {
    return getProductBySlug(slug);
  },
  async discounted(): Promise<Product[]> {
    return discountedProducts();
  },
};

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    Boolean(getProductById(item.id))
  );
}

function parseCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  writeStorage(CART_KEY, JSON.stringify(items));
}

function parseSavedIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is string => typeof id === "string"))].filter((id) => Boolean(getProductById(id)));
  } catch {
    return [];
  }
}

function parseStoredAddress(raw: string | null): AccountAddress | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const item = parsed as Record<string, unknown>;
    const fields = ["name", "region", "city", "street", "phone"] as const;
    return fields.every((field) => typeof item[field] === "string" && (item[field] as string).length > 0)
      ? {
          name: item.name as string,
          region: item.region as string,
          city: item.city as string,
          street: item.street as string,
          phone: item.phone as string,
        }
      : null;
  } catch {
    return null;
  }
}

export const cartApi = {
  async get(): Promise<CartItem[]> {
    return parseCart(readStorageRaw(CART_KEY));
  },
  async set(items: CartItem[]): Promise<void> {
    writeCart(items);
  },
  async add(id: string, quantity = 1): Promise<void> {
    const product = getProductById(id);
    if (!product) return;
    const items = parseCart(readStorageRaw(CART_KEY));
    const existing = items.find((item) => item.id === id);
    const next = existing
      ? items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + quantity } : item))
      : [...items, { id, quantity }];
    writeCart(next);
  },
  async updateQuantity(id: string, quantity: number): Promise<void> {
    const items = parseCart(readStorageRaw(CART_KEY));
    const next = quantity < 1
      ? items.filter((item) => item.id !== id)
      : items.map((item) => (item.id === id ? { ...item, quantity } : item));
    writeCart(next);
  },
  async remove(id: string): Promise<void> {
    writeCart(parseCart(readStorageRaw(CART_KEY)).filter((item) => item.id !== id));
  },
  async clear(): Promise<void> {
    writeStorage(CART_KEY, null);
  },
  subscribe(callback: (items: CartItem[]) => void): () => void {
    return subscribeStorageKey(CART_KEY, () => callback(parseCart(readStorageRaw(CART_KEY))));
  },
  subscribeWishlist(callback: (ids: string[]) => void): () => void {
    return subscribeStorageKey(SAVED_KEY, () => callback(parseSavedIds(readStorageRaw(SAVED_KEY))));
  },
  async toggleWishlist(id: string): Promise<void> {
    // Read-modify-write here rather than in the caller so every seam
    // consumer agrees on the same underlying storage entry.
    const ids = parseSavedIds(readStorageRaw(SAVED_KEY));
    const next = ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id];
    writeStorage(SAVED_KEY, JSON.stringify(next));
  },
  async getWishlist(): Promise<string[]> {
    return parseSavedIds(readStorageRaw(SAVED_KEY));
  },
};

function parseStoredOrders(raw: string | null): StoredOrder[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredOrder[];
  } catch {
    return [];
  }
}

export const ordersApi = {
  async getSellerOrders(): Promise<SellerOrder[]> {
    return readSellerOrders();
  },
  async saveSellerOrders(orders: SellerOrder[]): Promise<void> {
    saveSellerOrders(orders);
  },
  async getCustomerOrders(): Promise<StoredOrder[]> {
    return parseStoredOrders(readStorageRaw(ORDERS_STORAGE_KEY));
  },
  async addCustomerOrder(order: StoredOrder): Promise<void> {
    writeStorage(ORDERS_STORAGE_KEY, JSON.stringify([order, ...parseStoredOrders(readStorageRaw(ORDERS_STORAGE_KEY))]));
  },
};

function parseAccountSession(raw: string | null): AccountSession {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const session = parsed as Record<string, unknown>;
    return typeof session.email === "string" && session.email.length > 0 ? { email: session.email } : null;
  } catch {
    return null;
  }
}

export const authApi = {
  async getSellerSession(): Promise<SellerSession | null> {
    return parseSellerSession(readStorageRaw(SELLER_AUTH_KEY));
  },
  async setSellerSession(session: SellerSession): Promise<void> {
    writeSellerSession(session);
  },
  async clearSellerSession(): Promise<void> {
    wipeSellerSession();
  },
  async getDriverProfile(): Promise<DriverProfile | null> {
    return getDriverProfile();
  },
  async setDriverProfile(profile: DriverProfile): Promise<void> {
    writeDriverProfile(profile);
  },
  async clearDriverProfile(): Promise<void> {
    writeStorage(DRIVER_PROFILE_KEY, null);
  },
  async getAccountSession(): Promise<AccountSession> {
    return parseAccountSession(readStorageRaw(ACCOUNT_SESSION_KEY));
  },
  async setAccountSession(session: AccountSession): Promise<void> {
    // Mirrors the panel's previous write: null clears the storage entry,
    // and writeStorage notifies same-tab subscribers, so panels re-render.
    writeStorage(ACCOUNT_SESSION_KEY, session === null ? null : JSON.stringify(session));
  },
  async clearAccountSession(): Promise<void> {
    writeStorage(ACCOUNT_SESSION_KEY, null);
  },
  subscribeAccountSession(callback: (session: AccountSession) => void): () => void {
    // subscribeStorageKey only observes change events, not values, so the
    // fresh session is parsed on every notification before it reaches callers.
    return subscribeStorageKey(ACCOUNT_SESSION_KEY, () => callback(parseAccountSession(readStorageRaw(ACCOUNT_SESSION_KEY))));
  },
  subscribeSellerSession(callback: (session: SellerSession | null) => void): () => void {
    return subscribeStorageKey(SELLER_AUTH_KEY, () => callback(parseSellerSession(readStorageRaw(SELLER_AUTH_KEY))));
  },
  async getDriverAvailability(): Promise<"online" | "offline"> {
    return readDriverAvailability();
  },
  async setDriverAvailability(value: "online" | "offline"): Promise<void> {
    writeDriverAvailabilityRaw(value);
  },
  async clearDriverData(): Promise<void> {
    wipeDriverData();
  },
  async getDriverTasks(): Promise<DriverTask[]> {
    return readDriverTasks();
  },
  async setDriverTasks(tasks: DriverTask[]): Promise<void> {
    storeDriverTasks(tasks);
  },
  subscribeDriverProfile(callback: (profile: DriverProfile | null) => void): () => void {
    return subscribeStorageKey(DRIVER_PROFILE_KEY, () => callback(parseDriverProfile(readStorageRaw(DRIVER_PROFILE_KEY))));
  },
  subscribeDriverAvailability(callback: (value: "online" | "offline") => void): () => void {
    return subscribeStorageKey(DRIVER_AVAILABILITY_KEY, () => callback(parseDriverAvailability(readStorageRaw(DRIVER_AVAILABILITY_KEY))));
  },
  async getAddress(): Promise<AccountAddress | null> {
    return parseStoredAddress(readStorageRaw(ADDRESS_KEY));
  },
  async setAddress(address: AccountAddress): Promise<void> {
    // Same entry the address page wrote directly before its migration,
    // so previously saved addresses keep loading.
    writeStorage(ADDRESS_KEY, JSON.stringify(address));
  },
  async clearAddress(): Promise<void> {
    writeStorage(ADDRESS_KEY, null);
  },
  subscribeAddress(callback: (address: AccountAddress | null) => void): () => void {
    return subscribeStorageKey(ADDRESS_KEY, () => callback(parseStoredAddress(readStorageRaw(ADDRESS_KEY))));
  },
};
