"use client";

import type { Product, SellerOrder, StoredOrder } from "./types";

import { ordersApi as ordersApiLocal } from "./local";

export { cartApi, authApi } from "./local";

export const ordersApi = {
  ...ordersApiLocal,

  async getSellerOrders() {
    if (!token(SELLER_TOKEN_KEY)) return [];
    return requestJson<SellerOrder[]>("/seller/orders", SELLER_TOKEN_KEY);
  },

  async getCustomerOrders(): Promise<StoredOrder[]> {
    if (!token(CUSTOMER_TOKEN_KEY)) return [];
    return requestJson<StoredOrder[]>("/orders", CUSTOMER_TOKEN_KEY);
  },
};

const API_BASE = (
  (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_KORA_API_BASE : undefined) ??
  "http://localhost:4001/v1"
).replace(/\/+$/, "");

const SELLER_TOKEN_KEY = "kora-market-seller-token-v1";
const CUSTOMER_TOKEN_KEY = "kora-market-customer-token-v1";

function token(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

async function requestJson<T>(path: string, tokenKey?: string): Promise<T> {
  const headers = new Headers();
  const value = tokenKey ? token(tokenKey) : null;
  if (value) headers.set("Authorization", `Bearer ${value}`);
  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) throw new Error(`GET ${path} failed with ${response.status}`);
  return (await response.json()) as T;
}

async function fetchProducts(): Promise<Product[]> {
  const data = await requestJson<{ products: Product[] }>("/products");
  return data.products;
}

export const productsApi = {
  async list(): Promise<Product[]> {
    return fetchProducts();
  },
  async get(id: string): Promise<Product | undefined> {
    return (await fetchProducts()).find((product) => product.id === id);
  },
  async bySlug(slug: string): Promise<Product | undefined> {
    const response = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`GET /products/${slug} failed with ${response.status}`);
    return (await response.json()) as Product;
  },
  async discounted(): Promise<Product[]> {
    return (await fetchProducts()).filter(
      (product) =>
        product.compareAt !== undefined &&
        product.compareAt >= product.price * 1.05,
    );
  },
};
