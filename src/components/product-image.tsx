"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ProductImage({
  alt,
  className,
  fallbackSrc,
  priority,
  sizes,
  src,
}: {
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes: string;
  src: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const activeSrc = attempt === 2 ? fallbackSrc : src;

  if (!activeSrc || attempt > 2) {
    return <span aria-label={alt} className="absolute inset-0" role="img" />;
  }

  return (
    <>
      {loaded ? null : <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-muted" />}
      <Image
        alt={alt}
        className={cn(className, "transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        fill
        key={attempt}
        onError={() => {
          setLoaded(false);
          setAttempt(attempt + 1);
        }}
        onLoad={() => setLoaded(true)}
        priority={priority}
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0) setLoaded(true);
        }}
        sizes={sizes}
        src={activeSrc}
        unoptimized={attempt > 0}
      />
    </>
  );
}
