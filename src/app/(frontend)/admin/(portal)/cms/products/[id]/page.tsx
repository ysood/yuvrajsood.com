import { notFound } from "next/navigation";

import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminProduct } from "@/lib/admin-products";
import { getPayloadClient } from "@/lib/payload";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminSession();
  if (!user) return null;
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const payload = await getPayloadClient();
  let product;
  try {
    product = await payload.findByID({ collection: "products", depth: 1, id, overrideAccess: false, user });
  } catch {
    notFound();
  }

  return <ProductEditor blobUploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} product={toAdminProduct(product)} />;
}
