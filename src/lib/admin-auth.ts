import { cache } from "react";
import { headers } from "next/headers";

import { getPayloadClient } from "@/lib/payload";
import type { User } from "@/payload-types";

const configuredAdminEmail = () =>
  process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export const getAdminSession = cache(async (): Promise<User | null> => {
  const adminEmail = configuredAdminEmail();
  if (!adminEmail) return null;

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });

  if (
    !user ||
    user.collection !== "users" ||
    user.email.toLowerCase() !== adminEmail
  ) {
    return null;
  }

  return user;
});

export async function requireAdminUser(): Promise<User> {
  const user = await getAdminSession();
  if (!user) throw new Error("Unauthorized");
  return user;
}
