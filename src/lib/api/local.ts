// Versioned api seam — local adapter (Task 8 of 2026-10-18 plan).
// Thin wrappers over the seeded localStorage modules and the storage
// primitives in @/lib/local-store. Kept async so the http adapter in
// http.ts can implement the identical signatures against a backend.
// No existing callers migrate yet; migration is a follow-up.

"use client";

import type {
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

// CART_KEY mirrors CART_STORAGE_KEY in src/components/storefront-provider.tsx
// (that constant is module-private), so this adapter reads and writes the
// same storage entry the storefront UI already treats as the cart.
const CART_KEY = "kora-market-cart-v1";

// ORDERS_STORAGE_KEY mirrors ORDERS_KEY in src/components/checkout-view.tsx
// so customer orders land in the same storage entry checkout has always used.
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
    // subscribeStorageKey only observes change events, not values, so the
    // fresh cart is parsed on every notification before it reaches callers.
    return subscribeStorageKey(CART_KEY, () => callback(parseCart(readStorageRaw(CART_KEY))));
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
};
