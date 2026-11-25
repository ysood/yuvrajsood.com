"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { DisclosureLabel, labelFadeMs, useDisclosureHint } from "./disclosure-label";
import styles from "./home-roles.module.css";

const roles: { id: string; label: string; description: string; note?: string; href?: string }[] = [
  { id: "son", label: "son", description: "love you mom and dad" },
  {
    id: "creative-director",
    label: "creative director",
    href: "https://www.instagram.com/yvsdna",
    description: "visual media for international artists, reaching over 100 million souls.",
    note: "selected credits in music and sport include travis scott, the weeknd, and the nba.",
  },
  {
    id: "founder",
    label: "founder",
    href: "https://www.studiothreaded.com",
    description: "multidisciplinary creative and software studio. empowering smbs by integrating ai into their operations.",
    note: "curated a global network of exceptional creatives.",
  },
  {
    id: "student",
    label: "student",
    description: "software engineering honours at the university of sydney. major in engineering data science. minor in innovation & entrepreneurship.",
    note: "authored a thesis on a multi-agent ai system that automates regulatory compliance in cross-border medical data transfers.",
  },
];

const roleHintKey = "home-role-hint-dismissed";
const roleStaggerMs = 130;
const firstHintDelayMs = labelFadeMs + (roles.length - 1) * roleStaggerMs + 80;
const roleTriggerClass = "relative mx-auto flex min-h-6 w-fit cursor-pointer items-center rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-ring";

export function HomeRoles() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const roleList = useRef<HTMLUListElement>(null);
  const lastPointerType = useRef("");
  const { showHint, dismissHint } = useDisclosureHint(roleHintKey);
  const activeRole = hoveredRole ?? selectedRole;
  const hoverNote = roles.find(({ id }) => id === hoveredRole)?.note;

  useEffect(() => {
    if (!selectedRole) return;

    function closeOutside(event: globalThis.PointerEvent) {
      const row = event.target instanceof Element ? event.target.closest("li") : null;
      if (!row || !roleList.current?.contains(row)) setSelectedRole(null);
    }

    window.addEventListener("pointerdown", closeOutside);
    return () => window.removeEventListener("pointerdown", closeOutside);
  }, [selectedRole]);

  // Center the collapsed stack so expanding a row keeps its label under the pointer.
  return (
    <>
      <ul className="row-start-2 grid h-27 content-start gap-1 text-center text-sm" ref={roleList}>
        {roles.map(({ id, label, description, href }, index) => {
          const isVisible = activeRole === id;
          const descriptionId = `role-description-${id}`;
          const triggerProps = {
            "aria-controls": descriptionId,
            "aria-expanded": isVisible,
            onPointerEnter: (event: PointerEvent<HTMLElement>) => {
              if (event.pointerType === "mouse") {
                dismissHint();
                setHoveredRole(id);
              }
            },
          };
          const roleLabel = (
            <DisclosureLabel
              label={label}
              fadeDelay={index * roleStaggerMs}
              hintDelay={showHint ? firstHintDelayMs + index * 2000 : undefined}
            />
          );

          return (
            <li className="w-fit max-w-full justify-self-center" key={id} onPointerLeave={() => setHoveredRole(null)}>
              {href ? (
                <a
                  {...triggerProps}
                  className={cn(roleTriggerClass, "active:opacity-65 motion-safe:transition-opacity motion-safe:duration-150")}
                  href={href}
                  rel="noopener noreferrer"
                  target="_blank"
                  onPointerDown={(event) => { lastPointerType.current = event.pointerType; }}
                  onClick={(event) => {
                    const pointerType = lastPointerType.current;
                    lastPointerType.current = "";
                    if (!event.detail || (pointerType !== "touch" && pointerType !== "pen") || selectedRole === id) return;

                    event.preventDefault();
                    dismissHint();
                    setHoveredRole(null);
                    setSelectedRole(id);
                  }}
                >
                  {roleLabel}
                </a>
              ) : (
                <button
                  {...triggerProps}
                  className={roleTriggerClass}
                  onClick={() => {
                    dismissHint();
                    setHoveredRole(null);
                    setSelectedRole((current) => (current === id ? null : id));
                  }}
                  type="button"
                >
                  {roleLabel}
                </button>
              )}
              <div
                aria-hidden={!isVisible}
                className={cn(
                  "grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-200",
                  isVisible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
                id={descriptionId}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="cursor-default pt-1 pb-2 font-mono text-xs text-muted-foreground select-none">
                    {description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {hoverNote && (
        <p
          className={`${styles.note} pointer-events-none row-start-3 self-center justify-self-center text-center font-mono text-xs text-muted-foreground select-none`}
          key={hoveredRole}
        >
          {hoverNote}
        </p>
      )}
    </>
  );
}
