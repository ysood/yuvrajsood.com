import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { toAdminProduct } from "@/lib/admin-products";
import { getPayloadClient } from "@/lib/payload";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminSession();
  if (!user) return null;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const payload = await getPayloadClient();
  let result;
  try {
    result = await Promise.all([
      payload.findByID({ collection: "products", id, overrideAccess: false, user }),
      payload.find({ collection: "media", limit: 100, overrideAccess: false, sort: "-updatedAt", user }),
    ]);
  } catch {
    notFound();
  }
  const [product, media] = result;
  const mediaItems = media.docs.map(toAdminMediaItem).filter((item) => item !== null);
  if (product.image && typeof product.image === "object") {
    const currentItem = toAdminMediaItem(product.image);
    if (currentItem && !mediaItems.some(({ id }) => id === currentItem.id)) mediaItems.unshift(currentItem);
  }
  return <ProductEditor media={mediaItems} product={toAdminProduct(product)} />;
}
