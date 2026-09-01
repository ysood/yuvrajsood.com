import { cache } from "react";
import { headers } from "next/headers";

import { getPayloadClient } from "@/lib/payload";
import type { User } from "@/payload-types";

const configuredAdminEmail = () =>
  process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";

export async function ensureAdminCredential() {
  const email = configuredAdminEmail();
  if (!email) return null;

  const payload = await getPayloadClient();
  const existingAdmin = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email } },
  });

  if (existingAdmin.totalDocs === 0) {
    try {
      await payload.create({
        collection: "users",
        context: { adminCredentialBootstrap: true },
        data: {
          email,
          password: process.env.ADMIN_INITIAL_PASSWORD || "yvswebsite",
        },
        overrideAccess: true,
      });
      console.info(JSON.stringify({ event: "admin.bootstrap.created" }));
    } catch {
      const racedAdmin = await payload.find({
        collection: "users",
        limit: 1,
        overrideAccess: true,
        where: { email: { equals: email } },
      });
      if (racedAdmin.totalDocs === 0) throw new Error("Admin bootstrap failed");
    }
  }

  return email;
}

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
