import { LogOut, UserRound } from "lucide-react";
import Image from "next/image";

import { logoutAction } from "@/app/(frontend)/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { AdminMediaItem } from "@/lib/admin-media";

export function AdminShell({
  children,
  email,
  profileImage,
}: {
  children: React.ReactNode;
  email: string;
  profileImage: AdminMediaItem | null;
}) {
  const account = (
    <details className="group relative">
      <summary className="relative flex size-10 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {profileImage ? (
          <Image alt={profileImage.alt} className="rounded-full object-cover" fill sizes="40px" src={profileImage.thumbnailURL} />
        ) : (
          <UserRound aria-hidden="true" size={18} />
        )}
        <span className="sr-only">Open account menu</span>
      </summary>
      <div className="absolute left-0 top-12 z-50 w-64 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg md:left-12 md:top-0">
        <p className="truncate px-2 py-2 text-xs text-muted-foreground">{email}</p>
        <form action={logoutAction}>
          <Button className="w-full justify-start" type="submit" variant="ghost">
            <LogOut aria-hidden="true" />
            Log out
          </Button>
        </form>
      </div>
    </details>
  );

  return (
    <div className="min-h-screen bg-background text-foreground md:grid md:h-screen md:grid-cols-[5rem_1fr] md:overflow-hidden">
      <header className="sticky top-0 z-40 grid h-16 grid-cols-[1fr_auto_1fr] items-center border-b bg-background/90 px-3 backdrop-blur-md md:hidden">
        <div className="justify-self-start">{account}</div>
        <AdminNav />
        <div className="justify-self-end">
          <ThemeToggle />
        </div>
      </header>

      <aside className="hidden h-screen grid-rows-[auto_1fr_auto] border-r p-5 md:grid">
        {account}
        <div className="self-center">
          <AdminNav />
        </div>
        <ThemeToggle />
      </aside>

      <main className="min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
