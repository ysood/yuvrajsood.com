"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";

const mediaIDSchema = z.number().int().positive().nullable();

export async function saveProfileImageAction(input: number | null) {
  const mediaID = mediaIDSchema.safeParse(input);
  if (!mediaID.success) return { error: "Choose a valid image." };

  const user = await requireAdminUser();
  const payload = await getPayloadClient();

  if (mediaID.data !== null) {
    const media = await payload.findByID({
      collection: "media",
      id: mediaID.data,
      overrideAccess: false,
      user,
    });

    if (!media.alt.trim()) return { error: "Add alt text before using this image." };
  }

  await payload.updateGlobal({
    data: { profileImage: mediaID.data },
    overrideAccess: false,
    slug: "site-settings",
    user,
  });

  console.info(JSON.stringify({ event: "admin.profile-image.updated" }));
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/settings");

  return { success: "Profile image saved." };
}
