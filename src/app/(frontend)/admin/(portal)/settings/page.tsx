import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { ProfileImageSettings } from "@/components/admin/profile-image-settings";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { getSiteSettings } from "@/lib/admin-settings";

export default async function SettingsPage() {
  const user = await getAdminSession();
  if (!user) return null;

  const settings = await getSiteSettings(user);
  const profileImage =
    settings.profileImage && typeof settings.profileImage === "object"
      ? toAdminMediaItem(settings.profileImage)
      : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-normal">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage the private admin experience.</p>
      <div className="mt-10 space-y-10">
        <ProfileImageSettings blobUploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} initialImage={profileImage} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
