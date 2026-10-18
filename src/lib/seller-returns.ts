// DESIGN DIRECTION: seller returns and claims console — inspired by Jumia seller return lifecycle and claim submission; not Jumia-verified.

import { useCallback, useSyncExternalStore } from "react";

import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";
import { sellerNowMs } from "@/lib/seller-orders";

export const SELLER_RETURNS_KEY = "kora-market-seller-returns-v1";
export const SELLER_CLAIMS_KEY = "kora-market-seller-claims-v1";

export type SellerReturnStatus = "in-transit" | "item-received" | "refunded" | "rejected";

export type SellerReturn = {
  id: string;
  orderId: string;
  productName: string;
  qty: number;
  openedAt: string;
  city: string;
  status: SellerReturnStatus;
  reason: string;
  refundAmount: number;
};

export type SellerClaim = {
  id: string;
  returnId: string | null;
  orderId: string;
  createdAt: string;
  subject: string;
  details: string;
  contactEmail: string;
  status: "submitted";
};

type SellerReturnSeed = {
  id: string;
  orderId: string;
  hours: number;
  productName: string;
  qty: number;
  city: string;
  status: SellerReturnStatus;
  reason: string;
  refundAmount: number;
};

const sellerReturnSeeds: SellerReturnSeed[] = [
  { id: "KRT-2094", orderId: "KOS-1016", hours: 130, productName: "Countertop Coffee Maker", qty: 1, city: "Koforidua", status: "item-received", reason: "Not as described", refundAmount: 320 },
  { id: "KRT-2095", orderId: "KOS-1024", hours: 96, productName: "Everyday City Tote", qty: 1, city: "Tema", status: "in-transit", reason: "Damaged on arrival", refundAmount: 180 },
  { id: "KRT-2096", orderId: "KOS-1029", hours: 74, productName: "Everyday Smartphone", qty: 1, city: "Accra", status: "refunded", reason: "Faulty after first use", refundAmount: 2490 },
  { id: "KRT-2097", orderId: "KOS-1012", hours: 150, productName: "Classic Watch", qty: 1, city: "Ho", status: "rejected", reason: "Wrong item shipped", refundAmount: 0 },
];

function isSellerReturn(entry: unknown): entry is SellerReturn {
  if (typeof entry !== "object" || entry === null) return false;
  const sellerReturn = entry as Partial<SellerReturn>;
  return (
    typeof sellerReturn.id === "string" &&
    typeof sellerReturn.orderId === "string" &&
    typeof sellerReturn.productName === "string" &&
    typeof sellerReturn.qty === "number" &&
    typeof sellerReturn.openedAt === "string" &&
    typeof sellerReturn.city === "string" &&
    typeof sellerReturn.status === "string" &&
    typeof sellerReturn.reason === "string" &&
    typeof sellerReturn.refundAmount === "number"
  );
}

function isSellerReturnList(entry: unknown): entry is SellerReturn[] {
  return Array.isArray(entry) && entry.every(isSellerReturn);
}

function parseReturns(raw: string | null): SellerReturn[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSellerReturnList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function buildSeedReturns(): SellerReturn[] {
  const now = sellerNowMs();
  return sellerReturnSeeds.map((seed) => ({
    id: seed.id,
    orderId: seed.orderId,
    productName: seed.productName,
    qty: seed.qty,
    openedAt: new Date(now - seed.hours * 3600_000).toISOString(),
    city: seed.city,
    status: seed.status,
    reason: seed.reason,
    refundAmount: seed.refundAmount,
  }));
}

function returnStatusLabel(status: SellerReturnStatus): string {
  switch (status) {
    case "in-transit":
      return "In transit";
    case "item-received":
      return "Item received";
    case "refunded":
      return "Refunded";
    case "rejected":
      return "Rejected";
  }
}

function returnStatusClasses(status: SellerReturnStatus): string {
  switch (status) {
    case "in-transit":
      return "bg-info-soft text-ink";
    case "item-received":
      return "bg-sand text-ink";
    case "refunded":
      return "bg-ok-soft text-ok";
    case "rejected":
      return "bg-warn-soft text-ink";
  }
}

export type SellerReturnDialogStatus = "in-transit" | "item-received" | null;

let sellerReturnsRaw: string | null | undefined;
let sellerReturnsSnapshot: SellerReturn[] | null = null;

function browserSellerReturns(): SellerReturn[] {
  const raw = readStorageRaw(SELLER_RETURNS_KEY);
  if (sellerReturnsSnapshot === null || raw !== sellerReturnsRaw) {
    sellerReturnsRaw = raw;
    sellerReturnsSnapshot = parseReturns(raw) ?? buildSeedReturns();
  }
  return sellerReturnsSnapshot;
}

export function readSellerReturns(): SellerReturn[] {
  if (typeof window === "undefined") return buildSeedReturns();
  return browserSellerReturns();
}

export function updateSellerReturns(updater: (returns: SellerReturn[]) => SellerReturn[]): void {
  const next = updater(browserSellerReturns());
  if (next.length > 0) writeStorage(SELLER_RETURNS_KEY, JSON.stringify(next));
}

let sellerReturnsSeed: SellerReturn[] | null = null;

function serverSellerReturns(): SellerReturn[] {
  if (sellerReturnsSeed === null) {
    sellerReturnsSeed = buildSeedReturns();
  }
  return sellerReturnsSeed;
}

export function useSellerReturns(): SellerReturn[] {
  return useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SELLER_RETURNS_KEY, onStoreChange),
    browserSellerReturns,
    serverSellerReturns,
  );
}

export { returnStatusLabel, returnStatusClasses };

function isSellerClaim(entry: unknown): entry is SellerClaim {
  if (typeof entry !== "object" || entry === null) return false;
  const claim = entry as Partial<SellerClaim>;
  return (
    typeof claim.id === "string" &&
    typeof claim.orderId === "string" &&
    typeof claim.createdAt === "string" &&
    typeof claim.subject === "string" &&
    typeof claim.details === "string" &&
    typeof claim.contactEmail === "string" &&
    claim.status === "submitted"
  );
}

function isSellerClaimList(entry: unknown): entry is SellerClaim[] {
  return Array.isArray(entry) && entry.every(isSellerClaim);
}

function parseClaims(raw: string | null): SellerClaim[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isSellerClaimList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

let sellerClaimsRaw: string | null | undefined;
let sellerClaimsSnapshot: SellerClaim[] | null = null;

function browserSellerClaims(): SellerClaim[] {
  const raw = readStorageRaw(SELLER_CLAIMS_KEY);
  if (sellerClaimsSnapshot === null || raw !== sellerClaimsRaw) {
    sellerClaimsRaw = raw;
    sellerClaimsSnapshot = parseClaims(raw) ?? [];
  }
  return sellerClaimsSnapshot;
}

export function readSellerClaims(): SellerClaim[] {
  if (typeof window === "undefined") return [];
  return browserSellerClaims();
}

export function updateSellerClaims(updater: (claims: SellerClaim[]) => SellerClaim[]): void {
  const next = updater(browserSellerClaims());
  if (next.length > 0) writeStorage(SELLER_CLAIMS_KEY, JSON.stringify(next));
}

const sellerClaimsSeed: SellerClaim[] = [];

export function useSellerClaims(): SellerClaim[] {
  return useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SELLER_CLAIMS_KEY, onStoreChange),
    browserSellerClaims,
    () => sellerClaimsSeed,

  );
}

export function useSellerClaimActions(): { openSellerClaim: (claim: Omit<SellerClaim, "id">) => SellerClaim } {
  const openSellerClaim = useCallback((claim: Omit<SellerClaim, "id">): SellerClaim => {
    const claims = browserSellerClaims();
    const record: SellerClaim = { ...claim, id: `KCL-${4100 + claims.length + 1}` };
    writeStorage(SELLER_CLAIMS_KEY, JSON.stringify([...claims, record]));
    return record;
  }, []);
  return { openSellerClaim };
}
