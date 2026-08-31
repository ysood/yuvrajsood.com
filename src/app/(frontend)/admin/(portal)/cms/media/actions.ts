"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";

const idSchema = z.number().int().positive();
const altSchema = z.string().trim().min(1, "Alt text is required.").max(160, "Alt text is too long.");

export async function updateMediaAltAction(id: number, alt: string) {
  const parsedID = idSchema.safeParse(id);
  const parsedAlt = altSchema.safeParse(alt);
  if (!parsedID.success || !parsedAlt.success) return { error: parsedAlt.error?.issues[0]?.message || "Invalid image." };
  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  await payload.update({ collection: "media", data: { alt: parsedAlt.data }, id: parsedID.data, overrideAccess: false, user });
  console.info(JSON.stringify({ event: "admin.media.alt-updated", mediaID: parsedID.data }));
  revalidatePath("/admin/cms/media");
  revalidatePath("/admin/settings");
  revalidatePath("/products");
  return { success: "Alt text saved." };
}

export async function deleteMediaAction(id: number) {
  const parsedID = idSchema.safeParse(id);
  if (!parsedID.success) return { error: "Invalid image." };
  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  const [products, settings] = await Promise.all([
    payload.find({ collection: "products", limit: 5, overrideAccess: false, user, where: { image: { equals: parsedID.data } } }),
    payload.findGlobal({ depth: 0, overrideAccess: false, slug: "site-settings", user }),
  ]);
  const profileImageID = settings.profileImage && typeof settings.profileImage === "object" ? settings.profileImage.id : settings.profileImage;
  if (products.totalDocs > 0 || profileImageID === parsedID.data) return { error: "This image is still in use. Remove those references before deleting it." };

  await payload.delete({ collection: "media", id: parsedID.data, overrideAccess: false, user });
  console.info(JSON.stringify({ event: "admin.media.deleted", mediaID: parsedID.data }));
  revalidatePath("/admin/cms/media");
  revalidatePath("/admin/settings");
  return { success: "Image deleted." };
}
