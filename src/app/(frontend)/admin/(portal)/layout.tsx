import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAdminSession();
  if (!user) redirect("/admin/login");

  const payload = await getPayloadClient();
  const settings = await payload.findGlobal({
    depth: 1,
    overrideAccess: false,
    slug: "site-settings",
    user,
  });
  const profileImage =
    settings.profileImage && typeof settings.profileImage === "object"
      ? toAdminMediaItem(settings.profileImage)
      : null;

  return <AdminShell email={user.email} profileImage={profileImage}>{children}</AdminShell>;
}
