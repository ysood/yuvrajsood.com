"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const roles = [
  { id: "son", label: "Son", description: "Family and where I come from." },
  { id: "creative-director", label: "Creative Director", description: "Ideas, images, and how they come together." },
  { id: "founder", label: "Founder", description: "Things I’m building." },
  { id: "student", label: "Student", description: "What I’m learning along the way." },
];

export function HomeRoles() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const activeRole = hoveredRole ?? selectedRole;

  return (
    <ul className="grid justify-items-center gap-1 px-4 text-center text-sm">
      {roles.map(({ id, label, description }) => {
        const isVisible = activeRole === id;
        const descriptionId = `role-description-${id}`;

        return (
          <li key={id} onPointerLeave={() => setHoveredRole(null)}>
            <button
              aria-controls={descriptionId}
              aria-expanded={isVisible}
              className="min-h-8 cursor-pointer rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-ring"
              onClick={() => {
                setHoveredRole(null);
                setSelectedRole((current) => (current === id ? null : id));
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setHoveredRole(id);
              }}
              type="button"
            >
              {label}
            </button>
            <p
              aria-hidden={!isVisible}
              className={cn(
                "font-mono text-xs text-muted-foreground motion-safe:transition motion-safe:duration-150",
                isVisible ? "opacity-100" : "opacity-0 motion-safe:-translate-y-1",
              )}
              id={descriptionId}
            >
              {description}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
