import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { ProductsIntro } from "@/components/products-intro";
import { SiteDock } from "@/components/site-dock";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { getPayloadClient } from "@/lib/payload";

import styles from "./products.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "Of all the things I use every day, these are the ones I’d recommend to a friend.",
};

export default async function ProductsPage() {
  const payload = await getPayloadClient();
  const { docs: products } = await payload.find({
    collection: "products",
    depth: 1,
    limit: 100,
    sort: "name",
  });

  return (
    <main className="min-h-screen bg-background pb-[calc(5rem+env(safe-area-inset-bottom))] text-foreground">
      <SiteHeader hideNavigation />

      <ProductsIntro />

      <section className={`${styles.catalogue} mx-auto w-full max-w-site px-4 pb-8 sm:px-7 sm:pb-12`}>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card className="flex min-h-80 items-center justify-center border-0 px-6 text-center text-sm text-muted-foreground shadow-none">
            No products have been published yet.
          </Card>
        )}
      </section>
      <SiteDock current="/products" />
    </main>
  );
}
