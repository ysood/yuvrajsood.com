"use client";

import { useEffect, useSyncExternalStore } from "react";

const storageKey = "products-catalogue-count";

function defaultCount() {
  return 6;
}

function readCount() {
  try {
    const saved = localStorage.getItem(storageKey);
    const count = Number(saved);
    return saved !== null && Number.isInteger(count) && count >= 0 && count <= 100 ? count : defaultCount();
  } catch {
    return defaultCount();
  }
}

function subscribeToCount(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function useCataloguePlaceholderCount() {
  return useSyncExternalStore(subscribeToCount, readCount, defaultCount);
}

export function RememberCatalogueCount({ count }: { count: number }) {
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(count));
    } catch {
      // The loading grid can use its default when storage is unavailable.
    }
  }, [count]);

  return null;
}
