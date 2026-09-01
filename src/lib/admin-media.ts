import type { Payload } from "payload";

import type { Media, User } from "@/payload-types";

export type AdminMediaItem = {
  alt: string;
  filename: string;
  filesize: number;
  height: number;
  id: number;
  mimeType: string;
  url: string;
  width: number;
};

export function toAdminMediaItem(media: Media): AdminMediaItem | null {
  if (!media.url) return null;

  return {
    alt: media.alt,
    filename: media.filename || "Untitled image",
    filesize: media.filesize || 0,
    height: media.height || 0,
    id: media.id,
    mimeType: media.mimeType || "",
    url: media.url,
    width: media.width || 0,
  };
}

export function toMediaID(value: Media | null | number | undefined): number | null {
  if (!value) return null;
  return typeof value === "object" ? value.id : value;
}

export async function deleteMediaIfUnreferenced(payload: Payload, user: User, id: null | number) {
  if (!id) return;

  const [products, settings] = await Promise.all([
    payload.find({ collection: "products", depth: 0, limit: 1, overrideAccess: false, select: { image: true }, user, where: { image: { equals: id } } }),
    payload.findGlobal({ depth: 0, overrideAccess: false, slug: "site-settings", user }),
  ]);

  if (products.totalDocs > 0 || toMediaID(settings.profileImage) === id) return;

  await payload.delete({ collection: "media", id, overrideAccess: false, user });
  console.info(JSON.stringify({ event: "admin.media.deleted", mediaID: id }));
}
