"use client";

import { useEffect, useRef, type ReactNode } from "react";

const TICK_MS = 1000 / 120;
const STIFFNESS = 0.055;
const DAMPING = 0.29;
const SETTLE_THRESHOLD = 0.001;
const GAP_EXPANSION = 8;

export function SiteDockMotion({ children }: { children: ReactNode }) {
  const dockRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const items = [...dock.querySelectorAll("li")].map((item) => ({
      item,
      icon: item.querySelector("svg"),
      amount: 0,
      velocity: 0,
      target: 0,
      center: 0,
    }));
    if (items.length < 2) return;

    const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let radius = 0;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;

    function animate(now: number) {
      elapsed += Math.min(50, Math.max(0, now - lastTime));
      lastTime = now;

      while (elapsed >= TICK_MS) {
        for (const item of items) {
          item.velocity += STIFFNESS * (item.target - item.amount) - DAMPING * item.velocity;
          item.amount += item.velocity;
        }
        elapsed -= TICK_MS;
      }

      const settled = items.every(({ amount, target, velocity }) =>
        Math.abs(amount - target) < SETTLE_THRESHOLD && Math.abs(velocity) < SETTLE_THRESHOLD,
      );
      if (settled) {
        for (const item of items) {
          item.amount = item.target;
          item.velocity = 0;
        }
      }

      // Share the extra space between neighboring icons and keep the dock centered.
      let extraWidth = 0;
      for (let index = 1; index < items.length; index++) {
        extraWidth += GAP_EXPANSION * (items[index - 1].amount + items[index].amount);
      }

      let shift = -extraWidth / 2;
      for (const [index, { icon, amount }] of items.entries()) {
        if (index > 0) shift += GAP_EXPANSION * (items[index - 1].amount + amount);
        if (!icon) continue;
        if (settled && !amount && !shift) icon.style.removeProperty("transform");
        else icon.style.transform = `translate3d(${shift}px, ${-8 * amount}px, 0) scale(${1 + 0.48 * amount})`;
      }

      frame = settled ? 0 : requestAnimationFrame(animate);
    }

    function start() {
      if (frame) return;
      lastTime = performance.now();
      elapsed = 0;
      frame = requestAnimationFrame(animate);
    }

    function move(event: PointerEvent) {
      if (!motion.matches || event.pointerType !== "mouse") return;
      if (!radius) {
        for (const item of items) {
          const bounds = item.item.getBoundingClientRect();
          item.center = bounds.left + bounds.width / 2;
        }
        radius = 1.8 * (items[1].center - items[0].center);
        if (!radius) return;
      }

      for (const item of items) {
        const distance = Math.min(1, Math.abs(event.clientX - item.center) / radius);
        item.target = (1 + Math.cos(Math.PI * distance)) / 2;
      }
      start();
    }

    function leave() {
      if (!radius) return;
      radius = 0;
      if (!motion.matches) return;
      for (const item of items) item.target = 0;
      start();
    }

    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      radius = 0;
      for (const item of items) {
        item.amount = item.target = item.velocity = 0;
        item.icon?.style.removeProperty("transform");
      }
    }

    dock.addEventListener("pointermove", move);
    dock.addEventListener("pointerleave", leave);
    dock.addEventListener("pointercancel", leave);
    motion.addEventListener("change", reset);
    window.addEventListener("resize", leave);

    return () => {
      reset();
      dock.removeEventListener("pointermove", move);
      dock.removeEventListener("pointerleave", leave);
      dock.removeEventListener("pointercancel", leave);
      motion.removeEventListener("change", reset);
      window.removeEventListener("resize", leave);
    };
  }, []);

  return <ul className="pointer-events-auto flex gap-2" ref={dockRef}>{children}</ul>;
}
