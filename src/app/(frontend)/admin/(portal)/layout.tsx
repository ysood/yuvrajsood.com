import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { getSiteSettings } from "@/lib/admin-settings";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAdminSession();
  if (!user) redirect("/admin");

  const settings = await getSiteSettings(user);
  const profileImage =
    settings.profileImage && typeof settings.profileImage === "object"
      ? toAdminMediaItem(settings.profileImage)
      : null;

  return <AdminShell email={user.email} profileImage={profileImage}>{children}</AdminShell>;
}
