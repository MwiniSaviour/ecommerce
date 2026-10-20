// Versioned api seam — public entry point (Task 8 of 2026-10-18 plan).
// The four api objects below are bound to the http adapter; swapping any
// consumer from local to a backend is one import change inside this file.
// Local bindings stay available under the *ApiLocal aliases for testing
// and for callers that must keep reading seeded localStorage.

export { productsApi, cartApi, ordersApi, authApi } from "./http";
export {
  productsApi as productsApiLocal,
  cartApi as cartApiLocal,
  ordersApi as ordersApiLocal,
  authApi as authApiLocal,
} from "./local";

export type {
  AccountAddress,
  Product,
  ProductCategory,
  CategoryFilter,
  CartItem,
  SellerOrder,
  SellerOrderStatus,
  SellerOrderMethod,
  SellerSession,
  DriverProfile,
  DriverTask,
  DriverTaskStatus,
  StoredOrder,
  StoredOrderLine,
} from "./types";
