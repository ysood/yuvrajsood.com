"use client";

import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

import styles from "./home-roles.module.css";

const roles: { id: string; label: string; description: string; note?: string }[] = [
  { id: "son", label: "son", description: "love you mom and dad" },
  {
    id: "creative-director",
    label: "creative director",
    description: "visual media for international artists, reaching over 100 million souls.",
    note: "selected credits in music and sport include travis scott, the weeknd, and the nba.",
  },
  {
    id: "founder",
    label: "founder",
    description: "multidisciplinary creative and software studio. empowering smbs by integrating ai into their operations.",
    note: "curated a global network of exceptional creatives.",
  },
  {
    id: "student",
    label: "student",
    description: "software engineering honours at the university of sydney. major in engineering data science. minor in innovation & entrepreneurship.",
    note: "wrote a thesis on a multi-agent ai system for automating regulatory compliance in cross-border medical data transfers.",
  },
];

const roleHintKey = "home-role-hint-dismissed";
const roleEntranceMs = 420;
const roleStaggerMs = 60;
const firstHintDelayMs = roleEntranceMs + (roles.length - 1) * roleStaggerMs + 80;

function subscribeToSessionStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readRoleHintDismissal() {
  try {
    return sessionStorage.getItem(roleHintKey) === "1";
  } catch {
    return false;
  }
}

function getServerRoleHintDismissal() {
  return false;
}

export function HomeRoles() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [hasExpandedRole, setHasExpandedRole] = useState(false);
  const sessionDismissedHint = useSyncExternalStore(
    subscribeToSessionStorage,
    readRoleHintDismissal,
    getServerRoleHintDismissal,
  );
  const showHint = !hasExpandedRole && !sessionDismissedHint;
  const activeRole = hoveredRole ?? selectedRole;
  const hoverNote = roles.find(({ id }) => id === hoveredRole)?.note;

  function dismissHint() {
    if (!showHint) return;

    setHasExpandedRole(true);
    try {
      sessionStorage.setItem(roleHintKey, "1");
    } catch {
      // The local state also dismisses the hint when storage is unavailable.
    }
  }

  // Center the collapsed stack so expanding a row keeps its label under the pointer.
  return (
    <>
      <ul className="row-start-2 grid h-27 content-start gap-1 text-center text-sm">
        {roles.map(({ id, label, description }, index) => {
          const isVisible = activeRole === id;
          const descriptionId = `role-description-${id}`;

          return (
            <li className="w-fit max-w-full justify-self-center" key={id} onPointerLeave={() => setHoveredRole(null)}>
              <button
                aria-controls={descriptionId}
                aria-expanded={isVisible}
                className="relative mx-auto block min-h-6 cursor-pointer rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-ring"
                onClick={() => {
                  dismissHint();
                  setHoveredRole(null);
                  setSelectedRole((current) => (current === id ? null : id));
                }}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") {
                    dismissHint();
                    setHoveredRole(id);
                  }
                }}
                type="button"
              >
                <span className="block overflow-clip">
                  <span
                    className={`${styles.label} block`}
                    style={{ animationDuration: `${roleEntranceMs}ms`, animationDelay: `${index * roleStaggerMs}ms` }}
                  >
                    {label}
                  </span>
                </span>
                {showHint && (
                  <span
                    aria-hidden="true"
                    className={`${styles.hint} pointer-events-none select-none font-mono text-xs text-muted-foreground`}
                    style={{ animationDelay: `${firstHintDelayMs + index * 2000}ms` }}
                  >
                    ++
                  </span>
                )}
              </button>
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
