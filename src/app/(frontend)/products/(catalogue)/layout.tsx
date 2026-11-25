import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ProductsIntro } from "@/components/products-intro";
import { SiteHeader } from "@/components/site-header";

import styles from "../products.module.css";

export const metadata: Metadata = {
  title: "Products",
  description: "Of all the things I use every day, these are the ones I’d recommend to a friend.",
};

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] text-foreground">
      <SiteHeader hideNavigation />
      <ProductsIntro />
      <section className={`${styles.catalogue} mx-auto w-full max-w-site px-4 pb-8 sm:px-7 sm:pb-12`}>
        {children}
      </section>
    </main>
  );
}
