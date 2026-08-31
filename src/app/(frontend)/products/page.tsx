import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description: "A growing catalogue of products I use and recommend.",
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
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto flex w-full max-w-site flex-col items-center px-4 pb-20 pt-16 text-center sm:px-7 sm:pb-24 sm:pt-24">
        <p className="mb-5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
          A growing personal catalogue
        </p>
        <h1 className="max-w-2xl text-display font-normal sm:text-display-lg">
          Products I use, kept in one considered place.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-5 text-muted-foreground sm:text-base sm:leading-6">
          Useful objects, everyday tools, and occasional recommendations, each
          with a short note on why it has earned its place.
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
    </main>
  );
}
