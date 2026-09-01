"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveProfileImageAction } from "@/app/(frontend)/admin/(portal)/settings/actions";
import { ImageField } from "@/components/admin/image-field";
import type { AdminMediaItem } from "@/lib/admin-media";
import { cn } from "@/lib/utils";

export function ProfileImageSettings({
  blobUploadsEnabled,
  initialImage,
}: {
  blobUploadsEnabled: boolean;
  initialImage: AdminMediaItem | null;
}) {
  const router = useRouter();
  const [image, setImage] = useState(initialImage);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({});
  const [saving, startSaving] = useTransition();

  function commit(next: AdminMediaItem | null) {
    const previous = image;
    setImage(next);
    setFeedback({});
    startSaving(async () => {
      const result = await saveProfileImageAction(next?.id ?? null);
      setFeedback(result);
      if (result.error) setImage(previous);
      else router.refresh();
    });
  }

  return (
    <section aria-labelledby="profile-image-title" className="space-y-5">
      <div>
        <h2 className="font-medium" id="profile-image-title">Profile image</h2>
        <p className="mt-1 text-sm text-muted-foreground">Shown in the private admin navigation. Choosing an image saves it straight away and replaces the previous one.</p>
      </div>
      <ImageField
        alt="Profile image"
        blobUploadsEnabled={blobUploadsEnabled}
        busy={saving}
        image={image}
        onChange={commit}
        shape="circle"
      />
      <p aria-live="polite" className={cn("text-sm empty:hidden", feedback.error ? "text-destructive" : "text-muted-foreground")}>
        {feedback.error || feedback.success}
      </p>
    </section>
  );
}
