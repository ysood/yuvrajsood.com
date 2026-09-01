"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { deleteMediaIfUnreferenced, toMediaID } from "@/lib/admin-media";
import { getPayloadClient } from "@/lib/payload";

const mediaIDSchema = z.number().int().positive().nullable();

export type PasswordState = { error?: string; success?: string };
export type ProfileImageState = { error?: string; success?: string };

const newPasswordSchema = z
  .object({
    confirmPassword: z.string(),
    newPassword: z.string().min(8).max(100),
  })
  .refine(({ confirmPassword, newPassword }) => confirmPassword === newPassword, {
    message: "Passwords do not match.",
  });

export async function changePasswordAction(
  _previousState: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const input = newPasswordSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!input.success) {
    const issue = input.error.issues[0];
    return {
      error:
        issue?.message === "Passwords do not match."
          ? issue.message
          : "Use at least 8 characters.",
    };
  }

  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  await payload.update({
    collection: "users",
    data: { password: input.data.newPassword },
    id: user.id,
    overrideAccess: false,
    user,
  });

  console.info(JSON.stringify({ event: "admin.password.changed" }));
  return { success: "Password changed." };
}

export async function saveProfileImageAction(input: null | number): Promise<ProfileImageState> {
  const mediaID = mediaIDSchema.safeParse(input);
  if (!mediaID.success) return { error: "Choose a valid image." };

  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  const current = await payload.findGlobal({ depth: 0, overrideAccess: false, slug: "site-settings", user });
  const previousID = toMediaID(current.profileImage);

  try {
    await payload.updateGlobal({ data: { profileImage: mediaID.data }, overrideAccess: false, slug: "site-settings", user });
  } catch {
    return { error: "The profile image could not be saved. Try again." };
  }

  try {
    if (previousID !== mediaID.data) await deleteMediaIfUnreferenced(payload, user, previousID);
  } catch {
    console.error(JSON.stringify({ event: "admin.profile-image.cleanup-failed" }));
  }

  console.info(JSON.stringify({ event: "admin.profile-image.updated" }));
  revalidatePath("/admin", "layout");

  return { success: mediaID.data ? "Profile image updated." : "Profile image removed." };
}
