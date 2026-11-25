"use client";

import { ArrowUp } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import styles from "./site-dock.module.css";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function isPastThreshold() {
  return window.scrollY >= window.innerHeight * 1.2;
}

function getInitialVisibility() {
  return false;
}

export function BackToTop() {
  const visible = useSyncExternalStore(subscribeToScroll, isPastThreshold, getInitialVisibility);
  if (!visible) return null;

  return (
    <Button
      aria-label="Back to top"
      className={`${styles.backToTop} pointer-events-auto absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-background text-muted-foreground hover:bg-background hover:text-foreground dark:hover:bg-background sm:end-7`}
      onClick={() => window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })}
      size="icon"
      type="button"
      variant="ghost"
    >
      <ArrowUp aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
    </Button>
  );
}
