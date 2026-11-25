import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { SiteDock } from "@/components/site-dock";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Yuvraj Sood · Products" },
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

      <section className="mx-auto flex w-full max-w-site flex-col items-center px-4 pb-12 pt-6 text-center sm:px-7 sm:pb-16 sm:pt-8">
        <h1 className="text-sm font-normal">
          of all the things i use every day, these are the ones i’d recommend to a friend
        </h1>
        <p className="mt-2 max-w-xl text-pretty font-mono text-xs text-muted-foreground">
          a few of these brands have kindly offered you a discount through the links below, and i’m grateful for their support.
        </p>
      </section>

      <section className="mx-auto w-full max-w-site px-4 pb-8 sm:px-7 sm:pb-12">
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
