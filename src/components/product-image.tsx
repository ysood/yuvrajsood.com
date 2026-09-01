"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ProductImage({
  alt,
  className,
  priority,
  sizes,
  src,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {loaded ? null : <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-muted" />}
      <Image
        alt={alt}
        className={cn(className, "transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        fill
        onError={() => setLoaded(true)}
        onLoad={() => setLoaded(true)}
        priority={priority}
        ref={(node) => {
          if (node?.complete) setLoaded(true);
        }}
        sizes={sizes}
        src={src}
      />
    </>
  );
}
