"use client";

import { useState } from "react";

import { DisclosureLabel, labelFadeMs, useDisclosureHint } from "./disclosure-label";

export function ProductsIntro() {
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);
  const { showHint, dismissHint } = useDisclosureHint("products-intro-hint-dismissed");
  const expanded = hovered || selected;

  return (
    <section className="mx-auto flex w-full max-w-site flex-col items-center px-6 pb-12 pt-6 text-center sm:px-7 sm:pb-16 sm:pt-8">
      <div className="max-w-xl" onPointerLeave={() => setHovered(false)}>
        <h1 className="text-sm font-normal">
          <button
            aria-controls="products-intro-description"
            aria-expanded={expanded}
            className="relative mx-auto block min-h-6 cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
            onClick={() => {
              dismissHint();
              setHovered(false);
              setSelected((current) => !current);
            }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                dismissHint();
                setHovered(true);
              }
            }}
            type="button"
          >
            <DisclosureLabel
              label="of all the things i use every day, these are the ones i’d recommend to a friend"
              hintDelay={showHint ? labelFadeMs + 80 : undefined}
            />
          </button>
        </h1>
        <div
          aria-hidden={!expanded}
          className="grid grid-rows-[0fr] opacity-0 aria-[hidden=false]:grid-rows-[1fr] aria-[hidden=false]:opacity-100 motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-200"
          id="products-intro-description"
        >
          <div className="min-h-0 overflow-hidden">
            <p className="pt-2 text-pretty font-mono text-xs text-muted-foreground">
              a few of these brands have kindly offered you a discount through the links below, and i’m grateful for their support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
