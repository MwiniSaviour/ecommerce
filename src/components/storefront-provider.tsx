"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { cartApi } from "@/lib/api";
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

// Cart and wishlist storage moved behind the api seam (api-seam
// migration); this provider now reads and writes through cartApi
// instead of owning the kora-market-cart-v1 / kora-market-saved-v1
// localStorage entries.
const StorefrontContext = createContext<StorefrontContextValue | null>(null);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let active = true;
    void cartApi.get().then((items) => {
      if (active) setCartItems(items);
    });
    void cartApi.getWishlist().then((ids) => {
      if (active) setWishlistIds(ids);
    });
    const unsubscribeCart = cartApi.subscribe((items) => {
      if (active) setCartItems(items);
    });
    const unsubscribeWishlist = cartApi.subscribeWishlist((ids) => {
      if (active) setWishlistIds(ids);
    });
    return () => {
      active = false;
      unsubscribeCart();
      unsubscribeWishlist();
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current !== undefined) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(""), 3200);
  }, []);

  const addToCart = useCallback(
    (id: string, quantity = 1) => {
      const product = getProductById(id);
      if (!product) return;
      // cartApi.add performs the same read-modify-write against storage;
      // state stays in sync through the cartApi.subscribe callback.
      void cartApi.add(id, quantity);
      showToast(`${product.name} added to your cart`);
    },
    [showToast],
  );

  const updateCartItem = useCallback((id: string, quantity: number) => {
    void cartApi.updateQuantity(id, quantity);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    void cartApi.remove(id);
  }, []);

  const clearCart = useCallback(() => {
    void cartApi.clear();
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    void cartApi.toggleWishlist(id);
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
