"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <NextThemesProvider
      {...props}
      defaultTheme={isAdmin ? "light" : props.defaultTheme}
      enableSystem={isAdmin ? false : props.enableSystem}
      key={isAdmin ? "admin-theme" : "site-theme"}
      storageKey={isAdmin ? "admin-theme" : "theme"}
    >
      {children}
    </NextThemesProvider>
  );
}
