"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { AdminMediaItem } from "@/lib/admin-media";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ImageField({
  alt,
  blobUploadsEnabled,
  busy = false,
  image,
  onChange,
  shape = "square",
}: {
  alt: string;
  blobUploadsEnabled: boolean;
  busy?: boolean;
  image: AdminMediaItem | null;
  onChange: (image: AdminMediaItem | null) => void;
  shape?: "circle" | "square";
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function uploadFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return setError("Choose a PNG, JPEG, WebP, or AVIF image.");
    if (file.size > MAX_FILE_SIZE) return setError("Images must be 10 MB or smaller.");

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const body = new FormData();
      body.set("_payload", JSON.stringify({ alt: alt.trim() || file.name }));
      let directURL = "";

      if (blobUploadsEnabled) {
        const blob = await upload(file.name, file, {
          access: "public",
          clientPayload: "media",
          contentType: file.type,
          handleUploadUrl: "/api/vercel-blob-client-upload-route",
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        });
        directURL = blob.url;
        body.set("file", JSON.stringify({ clientUploadContext: {}, collectionSlug: "media", filename: decodeURIComponent(blob.pathname.split("/").pop() || file.name), mimeType: file.type, size: file.size }));
      } else {
        body.set("file", file);
      }

      const response = await fetch("/api/media?depth=0", { body, credentials: "include", method: "POST" });
      const result = (await response.json()) as { doc?: Record<string, unknown>; errors?: { message?: string }[]; message?: string };
      if (!response.ok || !result.doc) throw new Error(result.errors?.[0]?.message || result.message || "Upload failed.");

      const doc = result.doc;
      const item: AdminMediaItem = {
        alt: String(doc.alt || alt.trim() || file.name),
        filename: String(doc.filename || file.name),
        filesize: Number(doc.filesize || file.size),
        height: Number(doc.height || 0),
        id: Number(doc.id),
        mimeType: String(doc.mimeType || file.type),
        url: String(doc.url || directURL),
        width: Number(doc.width || 0),
      };
      if (!item.id || !item.url) throw new Error("Upload metadata was incomplete.");

      onChange(item);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const disabled = busy || uploading;

  return (
    <div className="flex flex-wrap items-center gap-5">
      <div
        className={cn("relative size-24 shrink-0 overflow-hidden border bg-muted", shape === "circle" ? "rounded-full" : "rounded-xl")}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) void uploadFile(event.dataTransfer.files[0]);
        }}
      >
        {image ? (
          <Image alt={image.alt} className={shape === "circle" ? "object-cover" : "object-contain"} fill sizes="96px" src={image.url} />
        ) : (
          <ImagePlus aria-hidden="true" className="absolute inset-0 m-auto text-muted-foreground" size={20} />
        )}
        {uploading ? (
          <span className="absolute inset-0 grid place-items-center bg-background/75 text-xs tabular-nums">{progress}%</span>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button disabled={disabled} onClick={() => fileInput.current?.click()} type="button" variant="outline">
            {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
            {image ? "Replace image" : "Choose image"}
          </Button>
          {image ? (
            <Button disabled={disabled} onClick={() => onChange(null)} type="button" variant="ghost">
              <Trash2 />
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, or AVIF. Maximum 10 MB.</p>
        <p aria-live="polite" className="text-xs text-destructive empty:hidden">{error}</p>
      </div>

      <input accept={ACCEPTED_TYPES.join(",")} className="sr-only" onChange={(event) => void uploadFile(event.target.files?.[0])} ref={fileInput} type="file" />
    </div>
  );
}
