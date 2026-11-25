"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const roles = [
  { id: "son", label: "Son", description: "love you mom and dad" },
  {
    id: "creative-director",
    label: "Creative Director",
    description: "visuals and content for international artists. the weeknd, travis scott, central cee and more.",
  },
  {
    id: "founder",
    label: "Founder",
    description: "multidisciplinary creative and software studio. helping SMBs integrate AI into their operations.",
  },
  {
    id: "student",
    label: "Student",
    description: "Software Engineering Honours student at the University of Sydney. Major in Engineering Data Science. Minor in Innovation & Entrepreneurship.",
  },
];

export function HomeRoles() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const activeRole = hoveredRole ?? selectedRole;

  // Center the collapsed stack so expanding a row keeps its label under the pointer.
  return (
    <ul className="grid h-27 content-start gap-1 text-center text-sm">
      {roles.map(({ id, label, description }) => {
        const isVisible = activeRole === id;
        const descriptionId = `role-description-${id}`;

        return (
          <li className="w-fit max-w-full justify-self-center" key={id} onPointerLeave={() => setHoveredRole(null)}>
            <button
              aria-controls={descriptionId}
              aria-expanded={isVisible}
              className="mx-auto block min-h-6 cursor-pointer rounded-sm px-2 focus-visible:outline-2 focus-visible:outline-ring"
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
            <div
              aria-hidden={!isVisible}
              className={cn(
                "grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-200",
                isVisible ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
              id={descriptionId}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="cursor-default pt-1 pb-2 font-mono text-xs text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
