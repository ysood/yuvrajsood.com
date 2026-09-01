"use client";

import { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MASK_CLASSES = "font-mono text-base tracking-[0.2em] md:text-sm";

export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const maskRef = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState(0);

  return (
    <div className="relative">
      <Input
        className={cn(MASK_CLASSES, "text-transparent caret-foreground", className)}
        onChange={(event) => setLength(event.target.value.length)}
        onScroll={(event) => {
          if (maskRef.current) maskRef.current.scrollLeft = event.currentTarget.scrollLeft;
        }}
        type="password"
        {...props}
      />
      <div
        aria-hidden="true"
        className={cn(MASK_CLASSES, "pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center overflow-hidden whitespace-pre px-3 leading-none")}
        ref={maskRef}
      >
        <span className="translate-y-[0.22em]">{"*".repeat(length)}</span>
      </div>
    </div>
  );
}
