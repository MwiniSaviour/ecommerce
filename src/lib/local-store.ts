"use client";

const listeners = new Map<string, Set<() => void>>();

function notifyKey(key: string) {
  const forKey = listeners.get(key);
  if (forKey === undefined) return;
  for (const callback of forKey) callback();
}

export function subscribeStorageKey(key: string, callback: () => void): () => void {
  let forKey = listeners.get(key);
  if (forKey === undefined) {
    forKey = new Set<() => void>();
    listeners.set(key, forKey);
  }
  forKey.add(callback);
  const handleStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) callback();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    const current = listeners.get(key);
    if (current !== undefined) {
      current.delete(callback);
      if (current.size === 0) listeners.delete(key);
    }
    window.removeEventListener("storage", handleStorage);
  };
}

export function readStorageRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    return;
  }
  notifyKey(key);
}
