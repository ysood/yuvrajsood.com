import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const navItemClass =
  "h-8 rounded-full px-2 text-xs font-normal text-foreground/55 hover:bg-transparent hover:text-foreground sm:px-3 sm:text-sm";

export function SiteHeader({ hideNavigation = false }: { hideNavigation?: boolean }) {
  return (
    <header className="grid h-20 w-full grid-cols-[auto_1fr_auto] items-center px-4 sm:h-24 sm:px-7">
      {!hideNavigation && (
        <>
          <Button asChild className="rounded-full text-xs tracking-tight" size="icon" variant="secondary">
            <Link aria-label="Yuvraj Sood home" href="/">
              YS
            </Link>
          </Button>

          <nav aria-label="Primary navigation" className="flex items-center justify-center">
            <Button asChild className={navItemClass} size="sm" variant="ghost">
              <Link href="/">Home</Link>
            </Button>
            <Button aria-disabled="true" className={navItemClass} size="sm" type="button" variant="ghost">
              Tour
            </Button>
            <Button asChild className={navItemClass} size="sm" variant="ghost">
              <Link href="/products">Products</Link>
            </Button>
            <Button aria-disabled="true" className={navItemClass} size="sm" type="button" variant="ghost">
              Contact
            </Button>
          </nav>
        </>
      )}

      <div className="col-start-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
