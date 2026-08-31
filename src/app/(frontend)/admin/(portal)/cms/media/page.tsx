import { MediaManager, type ManagedMediaItem } from "@/components/admin/media-manager";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { getPayloadClient } from "@/lib/payload";

export default async function MediaPage() {
  const user = await getAdminSession();
  if (!user) return null;
  const payload = await getPayloadClient();
  const [media, products, settings] = await Promise.all([
    payload.find({ collection: "media", limit: 100, overrideAccess: false, sort: "-updatedAt", user }),
    payload.find({ collection: "products", depth: 0, limit: 0, overrideAccess: false, select: { image: true, name: true }, user, where: { image: { exists: true } } }),
    payload.findGlobal({ depth: 0, overrideAccess: false, slug: "site-settings", user }),
  ]);
  const profileImageID = settings.profileImage && typeof settings.profileImage === "object" ? settings.profileImage.id : settings.profileImage;
  const usage = new Map<number, string[]>();
  for (const product of products.docs) {
    const imageID = product.image && typeof product.image === "object" ? product.image.id : product.image;
    if (imageID) usage.set(imageID, [...(usage.get(imageID) || []), `Product: ${product.name}`]);
  }
  if (profileImageID) usage.set(profileImageID, [...(usage.get(profileImageID) || []), "Site settings: profile image"]);
  const items = media.docs.flatMap((document) => {
    const item = toAdminMediaItem(document);
    return item ? [{ ...item, usage: usage.get(item.id) || [] } satisfies ManagedMediaItem] : [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-normal">Media</h1>
      <p className="mt-2 text-sm text-muted-foreground">Upload images, maintain alt text, and review where assets are used.</p>
      <div className="mt-10"><MediaManager blobUploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} items={items} /></div>
    </div>
  );
}
