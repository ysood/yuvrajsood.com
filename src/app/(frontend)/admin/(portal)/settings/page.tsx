import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { ProfileImageSettings } from "@/components/admin/profile-image-settings";
import { getAdminSession } from "@/lib/admin-auth";
import { toAdminMediaItem } from "@/lib/admin-media";
import { getPayloadClient } from "@/lib/payload";

export default async function SettingsPage() {
  const user = await getAdminSession();
  if (!user) return null;

  const payload = await getPayloadClient();
  const [settings, media] = await Promise.all([
    payload.findGlobal({
      depth: 1,
      overrideAccess: false,
      slug: "site-settings",
      user,
    }),
    payload.find({
      collection: "media",
      limit: 100,
      overrideAccess: false,
      sort: "-updatedAt",
      user,
    }),
  ]);
  const selectedID =
    settings.profileImage && typeof settings.profileImage === "object"
      ? settings.profileImage.id
      : settings.profileImage || null;
  const mediaItems = media.docs.map(toAdminMediaItem).filter((item) => item !== null);
  if (settings.profileImage && typeof settings.profileImage === "object") {
    const currentItem = toAdminMediaItem(settings.profileImage);
    if (currentItem && !mediaItems.some(({ id }) => id === currentItem.id)) mediaItems.unshift(currentItem);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="text-3xl font-normal">Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage the private admin experience.</p>
      <div className="mt-10">
        <ProfileImageSettings
          blobUploadsEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)}
          initialMedia={mediaItems}
          initialSelection={selectedID}
        />
        <div className="mt-10">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
