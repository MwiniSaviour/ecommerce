"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { CategoryFilter } from "@/lib/products";
import { getProductById } from "@/lib/products";

export type CartItem = { id: string; quantity: number };

type StorefrontContextValue = {
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (id: string, quantity?: number) => void;
  updateCartItem: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  wishlistIds: string[];
  toggleWishlist: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeCategory: CategoryFilter;
  setActiveCategory: (category: CategoryFilter) => void;
  savedOnly: boolean;
  setSavedOnly: Dispatch<SetStateAction<boolean>>;
  toastMessage: string;
  showToast: (message: string) => void;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);
const CART_STORAGE_KEY = "kora-market-cart-v1";
const SAVED_STORAGE_KEY = "kora-market-saved-v1";

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

function parseCart(raw: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

function parseWishlist(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id): id is string => typeof id === "string"))].filter((id) => Boolean(getProductById(id)));
  } catch {
    return [];
  }
}

function createLocalStorageStore<T>(key: string, fallback: T, parse: (raw: string) => T) {
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;
  const listeners = new Set<() => void>();

  function getSnapshot() {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (cachedRaw === raw && cachedRaw !== undefined) return cachedValue;
      cachedRaw = raw;
      cachedValue = raw === null ? fallback : parse(raw);
    } catch {
      cachedRaw = undefined;
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function getServerSnapshot() {
    return fallback;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        cachedRaw = undefined;
        notify();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", handleStorage);
    };
  }

  function setState(updater: T | ((previous: T) => T)) {
    const previous = getSnapshot();
    const next = typeof updater === "function" ? (updater as (value: T) => T)(previous) : updater;
    cachedValue = next;
    cachedRaw = JSON.stringify(next);
    try {
      window.localStorage.setItem(key, cachedRaw);
    } catch {
      cachedRaw = undefined;
    }
    notify();
  }

  return { getSnapshot, getServerSnapshot, subscribe, setState };
}

const cartStore = createLocalStorageStore<CartItem[]>(CART_STORAGE_KEY, [], parseCart);
const wishlistStore = createLocalStorageStore<string[]>(SAVED_STORAGE_KEY, [], parseWishlist);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const cartItems = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const wishlistIds = useSyncExternalStore(wishlistStore.subscribe, wishlistStore.getSnapshot, wishlistStore.getServerSnapshot);
  const [isCartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(""), 3200);
  }, []);

  const addToCart = useCallback(
    (id: string, quantity = 1) => {
      const product = getProductById(id);
      if (!product) return;
      cartStore.setState((items) => {
        const existing = items.find((item) => item.id === id);
        if (existing) {
          return items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [...items, { id, quantity }];
      });
      showToast(`${product.name} added to your cart`);
    },
    [showToast],
  );

  const updateCartItem = useCallback((id: string, quantity: number) => {
    cartStore.setState((items) =>
      quantity < 1
        ? items.filter((item) => item.id !== id)
        : items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const removeFromCart = useCallback((id: string) => {
    cartStore.setState((items) => items.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    cartStore.setState(() => []);
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    wishlistStore.setState((ids) => (ids.includes(id) ? ids.filter((savedId) => savedId !== id) : [...ids, id]));
  }, []);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const value = useMemo<StorefrontContextValue>(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      isCartOpen,
      setCartOpen,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      wishlistIds,
      toggleWishlist,
      searchTerm,
      setSearchTerm,
      activeCategory,
      setActiveCategory,
      savedOnly,
      setSavedOnly,
      toastMessage,
      showToast,
    }),
    [
      cartItems,
      cartCount,
      cartSubtotal,
      isCartOpen,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      wishlistIds,
      toggleWishlist,
      searchTerm,
      activeCategory,
      savedOnly,
      toastMessage,
      showToast,
    ],
  );

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("useStorefront must be used inside StorefrontProvider");
  return context;
}
