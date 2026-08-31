"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { saveProfileImageAction } from "@/app/(frontend)/admin/(portal)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminMediaItem } from "@/lib/admin-media";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Feedback = { error?: string; success?: string };

function validateFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Choose a PNG, JPEG, WebP, or AVIF image.";
  }
  if (file.size > MAX_FILE_SIZE) return "Images must be 10 MB or smaller.";
  return null;
}

export function ProfileImageSettings({
  blobUploadsEnabled,
  initialMedia,
  initialSelection,
}: {
  blobUploadsEnabled: boolean;
  initialMedia: AdminMediaItem[];
  initialSelection: number | null;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const previewURLRef = useRef<string | null>(null);
  const [media, setMedia] = useState(initialMedia);
  const [selectedID, setSelectedID] = useState(initialSelection);
  const [savedID, setSavedID] = useState(initialSelection);
  const [file, setFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>({});
  const [saving, startSaving] = useTransition();

  useEffect(
    () => () => {
      if (previewURLRef.current) URL.revokeObjectURL(previewURLRef.current);
    },
    [],
  );

  const selected = media.find((item) => item.id === selectedID) ?? null;
  const changed = selectedID !== savedID;

  function chooseFile(nextFile: File | undefined) {
    if (!nextFile) return;
    const error = validateFile(nextFile);
    if (error) {
      setFeedback({ error });
      return;
    }
    if (previewURLRef.current) URL.revokeObjectURL(previewURLRef.current);
    const nextPreviewURL = URL.createObjectURL(nextFile);
    previewURLRef.current = nextPreviewURL;
    setFile(nextFile);
    setPreviewURL(nextPreviewURL);
    setAlt("");
    setFeedback({});
  }

  function clearFile() {
    if (previewURLRef.current) URL.revokeObjectURL(previewURLRef.current);
    previewURLRef.current = null;
    setPreviewURL(null);
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function createMedia() {
    if (!file) return;
    if (!alt.trim()) {
      setFeedback({ error: "Alt text is required before uploading." });
      return;
    }

    setUploading(true);
    setProgress(0);
    setFeedback({});

    try {
      const body = new FormData();
      body.set("_payload", JSON.stringify({ alt: alt.trim() }));
      let directBlobURL = "";

      if (blobUploadsEnabled) {
        const blob = await upload(file.name, file, {
          access: "public",
          clientPayload: "media",
          contentType: file.type,
          handleUploadUrl: "/api/vercel-blob-client-upload-route",
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        });
        directBlobURL = blob.url;
        const filename = decodeURIComponent(blob.pathname.split("/").pop() || file.name);
        body.set(
          "file",
          JSON.stringify({
            clientUploadContext: {},
            collectionSlug: "media",
            filename,
            mimeType: file.type,
            size: file.size,
          }),
        );
      } else {
        body.set("file", file);
      }

      const response = await fetch("/api/media?depth=0", {
        body,
        credentials: "include",
        method: "POST",
      });
      const result = (await response.json()) as {
        doc?: Record<string, unknown>;
        errors?: { message?: string }[];
        message?: string;
      };

      if (!response.ok || !result.doc) {
        throw new Error(result.errors?.[0]?.message || result.message || "Upload failed.");
      }

      const doc = result.doc;
      const sizes = doc.sizes as { small?: { url?: string } } | undefined;
      const item: AdminMediaItem = {
        alt: String(doc.alt || alt.trim()),
        filename: String(doc.filename || file.name),
        filesize: Number(doc.filesize || file.size),
        height: Number(doc.height || 0),
        id: Number(doc.id),
        mimeType: String(doc.mimeType || file.type),
        thumbnailURL: String(sizes?.small?.url || doc.url || directBlobURL),
        url: String(doc.url || directBlobURL),
        width: Number(doc.width || 0),
      };

      if (!item.id || !item.url || !item.thumbnailURL) throw new Error("Upload metadata was incomplete.");
      setMedia((items) => [item, ...items.filter(({ id }) => id !== item.id)]);
      setSelectedID(item.id);
      clearFile();
      setAlt("");
      setFeedback({ success: "Image uploaded. Save to use it as your profile image." });
      router.refresh();
    } catch (error) {
      setFeedback({ error: error instanceof Error ? error.message : "Upload failed." });
    } finally {
      setUploading(false);
    }
  }

  function save() {
    startSaving(async () => {
      const result = await saveProfileImageAction(selectedID);
      setFeedback(result);
      if (result.success) {
        setSavedID(selectedID);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="current-profile-image" className="space-y-4">
        <div>
          <h2 className="font-medium" id="current-profile-image">Profile image</h2>
          <p className="mt-1 text-sm text-muted-foreground">Shown in the private admin navigation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative size-24 overflow-hidden rounded-full border bg-muted">
            {selected ? (
              <Image alt={selected.alt} className="object-cover" fill sizes="96px" src={selected.thumbnailURL} />
            ) : (
              <ImagePlus aria-hidden="true" className="absolute inset-0 m-auto text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => fileInput.current?.click()} type="button" variant="outline">Choose image</Button>
            {selectedID !== null ? (
              <Button onClick={() => setSelectedID(null)} type="button" variant="ghost">Remove</Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="upload-image">
        <div>
          <h2 className="font-medium" id="upload-image">Upload a new image</h2>
          <p className="mt-1 text-sm text-muted-foreground">PNG, JPEG, WebP, or AVIF. Maximum 10 MB.</p>
        </div>
        <button
          className="flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => fileInput.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            chooseFile(event.dataTransfer.files[0]);
          }}
          type="button"
        >
          <UploadCloud aria-hidden="true" className="mb-2" />
          Drop an image here or choose a file
        </button>
        <input
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(event) => chooseFile(event.target.files?.[0])}
          ref={fileInput}
          type="file"
        />

        {file && previewURL ? (
          <div className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image alt="New image preview" className="object-contain" fill sizes="112px" src={previewURL} unoptimized />
            </div>
            <div className="min-w-0 space-y-2">
              <p className="truncate text-sm">{file.name}</p>
              <Label htmlFor="new-image-alt">Alt text</Label>
              <Input id="new-image-alt" maxLength={160} onChange={(event) => setAlt(event.target.value)} placeholder="Describe the image" value={alt} />
            </div>
            <Button aria-label="Cancel upload" disabled={uploading} onClick={clearFile} size="icon" type="button" variant="ghost"><X /></Button>
            <div className="sm:col-start-2">
              <Button disabled={uploading || !alt.trim()} onClick={createMedia} type="button">
                {uploading ? <LoaderCircle className="animate-spin" /> : null}
                {uploading ? `Uploading ${progress}%` : "Upload image"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4" aria-labelledby="media-library">
        <div>
          <h2 className="font-medium" id="media-library">Media library</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose an existing asset.</p>
        </div>
        {media.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {media.map((item) => (
              <button
                aria-label={`Use ${item.alt}`}
                aria-pressed={selectedID === item.id}
                className={cn("relative aspect-square overflow-hidden rounded-xl border-2 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selectedID === item.id ? "border-foreground" : "border-transparent")}
                key={item.id}
                onClick={() => setSelectedID(item.id)}
                type="button"
              >
                <Image alt={item.alt} className="object-cover" fill sizes="(max-width: 639px) 30vw, 144px" src={item.thumbnailURL} />
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border p-6 text-sm text-muted-foreground">No images have been uploaded yet.</p>
        )}
      </section>

      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background/90 py-4 backdrop-blur-md">
        <p aria-live="polite" className={cn("text-sm", feedback.error ? "text-destructive" : "text-muted-foreground")}>{feedback.error || feedback.success}</p>
        <div className="flex gap-2">
          <Button disabled={!changed || saving} onClick={() => { setSelectedID(savedID); setFeedback({}); }} type="button" variant="ghost">Cancel</Button>
          <Button disabled={!changed || saving} onClick={save} type="button">{saving ? <LoaderCircle className="animate-spin" /> : null}{saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
