import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { getPayloadClient } from "@/lib/payload";

export default async function NewProductPage() {
  const user = await getAdminSession();
  if (!user) return null;
  const payload = await getPayloadClient();
  const media = await payload.find({ collection: "media", limit: 100, overrideAccess: false, sort: "-updatedAt", user });
  return <ProductEditor media={media.docs.map(toAdminMediaItem).filter((item) => item !== null)} product={null} />;
}
