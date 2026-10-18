// DESIGN DIRECTION: seller account settings — inspired by Jumia seller holiday mode and payout controls; not Jumia-verified.

import { useSyncExternalStore } from "react";

import { readStorageRaw, subscribeStorageKey, writeStorage } from "@/lib/local-store";

export const SELLER_SETTINGS_KEY = "kora-market-seller-settings-v1";

export type SellerSettings = {
  reconciled: boolean;
  holidayMode: boolean;
};

export const defaultSellerSettings: SellerSettings = {
  reconciled: false,
  holidayMode: false,
};

function isSellerSettings(entry: unknown): entry is SellerSettings {
  if (typeof entry !== "object" || entry === null) return false;
  const settings = entry as Partial<SellerSettings>;
  return typeof settings.reconciled === "boolean" && typeof settings.holidayMode === "boolean";
}

export function readSellerSettings(): SellerSettings {
  if (typeof window === "undefined") return defaultSellerSettings;
  let parsed: unknown;
  try {
    parsed = JSON.parse(readStorageRaw(SELLER_SETTINGS_KEY) ?? "null");
  } catch {
    parsed = null;
  }
  return isSellerSettings(parsed) ? parsed : defaultSellerSettings;
}

let sellerSettingsRaw: string | null | undefined;
let sellerSettingsSnapshot: SellerSettings | null = null;

function browserSellerSettings(): SellerSettings {
  const raw = readStorageRaw(SELLER_SETTINGS_KEY);
  if (sellerSettingsSnapshot === null || raw !== sellerSettingsRaw) {
    sellerSettingsRaw = raw;
    sellerSettingsSnapshot = raw === null ? defaultSellerSettings : readSellerSettings();
  }
  return sellerSettingsSnapshot;
}

export function saveSellerSettings(settings: SellerSettings): void {
  writeStorage(SELLER_SETTINGS_KEY, JSON.stringify(settings));
}

export function updateSellerSettings(updater: (settings: SellerSettings) => SellerSettings): void {
  saveSellerSettings(updater(readSellerSettings()));
}

function serverSellerSettings(): SellerSettings {
  return defaultSellerSettings;
}

export function useSellerSettings(): SellerSettings {
  return useSyncExternalStore(
    (onStoreChange) => subscribeStorageKey(SELLER_SETTINGS_KEY, onStoreChange),
    browserSellerSettings,
    serverSellerSettings,
  );
}
