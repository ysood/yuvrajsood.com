import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PurchaseButton({
  className,
  href,
  label,
}: {
  className?: string;
  href: null | string;
  label: string;
}) {
  if (!href) {
    return (
      <Button className={className} disabled title="No purchase link available" type="button">
        <span className="line-through">{label}</span>
      </Button>
    );
  }

  return (
    <Button asChild className={className}>
      <a href={href} rel="noreferrer" target="_blank">
        {label}
        <ArrowUpRight aria-hidden="true" size={16} />
      </a>
    </Button>
  );
}
