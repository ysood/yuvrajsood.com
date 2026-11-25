"use client";

import { useLinkStatus } from "next/link";

export function DockLinkStatus() {
  const { pending } = useLinkStatus();

  return pending ? <span aria-hidden="true" data-dock-pending hidden /> : null;
}
