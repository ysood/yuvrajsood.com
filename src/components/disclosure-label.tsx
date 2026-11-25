"use client";

import { useState, useSyncExternalStore } from "react";

import styles from "./disclosure-label.module.css";

export const labelFadeMs = 680;

function subscribeToSessionStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getServerHintDismissal() {
  return false;
}

export function useDisclosureHint(storageKey: string) {
  const [dismissed, setDismissed] = useState(false);
  const sessionDismissed = useSyncExternalStore(subscribeToSessionStorage, () => {
    try {
      return sessionStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  }, getServerHintDismissal);
  const showHint = !dismissed && !sessionDismissed;

  function dismissHint() {
    if (!showHint) return;

    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // The local state also dismisses the hint when storage is unavailable.
    }
  }

  return { showHint, dismissHint };
}

export function DisclosureLabel({ label, fadeDelay = 0, hintDelay }: {
  label: string;
  fadeDelay?: number;
  hintDelay?: number;
}) {
  return (
    <>
      <span
        className={`${styles.label} block`}
        style={{ animationDuration: `${labelFadeMs}ms`, animationDelay: `${fadeDelay}ms` }}
      >
        {label}
      </span>
      {hintDelay !== undefined && (
        <span
          aria-hidden="true"
          className={`${styles.hint} pointer-events-none select-none font-mono text-xs text-muted-foreground`}
          style={{ animationDelay: `${hintDelay}ms` }}
        >
          ++
        </span>
      )}
    </>
  );
}
