import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { getPayloadClient } from "@/lib/payload";

import styles from "../products.module.css";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const payload = await getPayloadClient();
  const { docs: products } = await payload.find({
    collection: "products",
    depth: 1,
    limit: 100,
    sort: "name",
  });

  return products.length ? (
    <div className={`${styles.catalogueContent} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  ) : (
    <Card className={`${styles.catalogueContent} flex min-h-80 items-center justify-center border-0 px-6 text-center text-sm text-muted-foreground shadow-none`}>
      No products have been published yet.
    </Card>
  );
}
