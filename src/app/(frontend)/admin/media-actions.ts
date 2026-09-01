"use server";

import { z } from "zod";

import { requireAdminUser } from "@/lib/admin-auth";
import { deleteMediaIfUnreferenced } from "@/lib/admin-media";
import { getPayloadClient } from "@/lib/payload";

export async function discardUploadedImageAction(id: number) {
  const parsedID = z.number().int().positive().safeParse(id);
  if (!parsedID.success) return;

  const user = await requireAdminUser();
  const payload = await getPayloadClient();
  await deleteMediaIfUnreferenced(payload, user, parsedID.data);
}
