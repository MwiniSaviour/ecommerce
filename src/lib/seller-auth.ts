import { useCallback, useSyncExternalStore } from "react";
import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";

// DESIGN DIRECTION: Aries & Co. Phones session — inspired by Jumia seller
// hub's persistent signed-in state; not Jumia-verified.
export type SellerSession = {
  name: string;
  email: string;
  business: string;
  since: string;
};

export const SELLER_AUTH_KEY = "kora-market-seller-auth-v1";

export const SELLER_DEMO_ACCOUNT = {
  email: "aries@koravendorhub.com",
  password: "KoraDemo2026",
};

function parseSellerSession(value: string | null): SellerSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SellerSession> | null;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.business !== "string" ||
      typeof parsed.since !== "string"
    ) {
      return null;
    }
    return {
      name: parsed.name,
      email: parsed.email,
      business: parsed.business,
      since: parsed.since,
    };
  } catch {
    return null;
  }
}

export function useSellerSession(): SellerSession | null {
  const raw = useSyncExternalStore(
    useCallback((onStoreChange: () => void) => subscribeStorageKey(SELLER_AUTH_KEY, onStoreChange), []),
    () => readStorageRaw(SELLER_AUTH_KEY),
    () => null,
  );
  return parseSellerSession(raw);
}

export function setSellerSession(session: SellerSession): void {
  writeStorage(SELLER_AUTH_KEY, JSON.stringify(session));
}

export function clearSellerSession(): void {
  writeStorage(SELLER_AUTH_KEY, null);
}
