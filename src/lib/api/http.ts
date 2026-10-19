// Versioned api seam — http adapter (Task 8 of 2026-10-18 plan).
// Backend-phase placeholder: every method throws until a real API exists.
// Signatures must stay identical to the local adapter in local.ts so any
// import site can switch between them by changing one file name.

"use client";

import type { CartItem, DriverProfile, Product, SellerOrder, SellerSession, StoredOrder } from "./types";

const notImplemented = "http adapter not implemented — backend phase";

export const productsApi = {
  async list(): Promise<Product[]> {
    throw new Error(notImplemented);
  },
  async get(id: string): Promise<Product | undefined> {
    throw new Error(notImplemented);
  },
  async bySlug(slug: string): Promise<Product | undefined> {
    throw new Error(notImplemented);
  },
  async discounted(): Promise<Product[]> {
    throw new Error(notImplemented);
  },
};

export const cartApi = {
  async get(): Promise<CartItem[]> {
    throw new Error(notImplemented);
  },
  async set(items: CartItem[]): Promise<void> {
    throw new Error(notImplemented);
  },
  async add(id: string, quantity = 1): Promise<void> {
    throw new Error(notImplemented);
  },
  async updateQuantity(id: string, quantity: number): Promise<void> {
    throw new Error(notImplemented);
  },
  async remove(id: string): Promise<void> {
    throw new Error(notImplemented);
  },
  async clear(): Promise<void> {
    throw new Error(notImplemented);
  },
  subscribe(_callback: (items: CartItem[]) => void): () => void {
    throw new Error(notImplemented);
  },
};

export const ordersApi = {
  async getSellerOrders(): Promise<SellerOrder[]> {
    throw new Error(notImplemented);
  },
  async saveSellerOrders(orders: SellerOrder[]): Promise<void> {
    throw new Error(notImplemented);
  },
  async getCustomerOrders(): Promise<StoredOrder[]> {
    throw new Error(notImplemented);
  },
  async addCustomerOrder(order: StoredOrder): Promise<void> {
    throw new Error(notImplemented);
  },
};

export const authApi = {
  async getSellerSession(): Promise<SellerSession | null> {
    throw new Error(notImplemented);
  },
  async setSellerSession(session: SellerSession): Promise<void> {
    throw new Error(notImplemented);
  },
  async clearSellerSession(): Promise<void> {
    throw new Error(notImplemented);
  },
  async getDriverProfile(): Promise<DriverProfile | null> {
    throw new Error(notImplemented);
  },
  async setDriverProfile(profile: DriverProfile): Promise<void> {
    throw new Error(notImplemented);
  },
  async clearDriverProfile(): Promise<void> {
    throw new Error(notImplemented);
  },
};
