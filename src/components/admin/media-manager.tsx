"use client";

import { upload } from "@vercel/blob/client";
import { ImagePlus, LoaderCircle, Pencil, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { deleteMediaAction, updateMediaAltAction } from "@/app/(frontend)/admin/(portal)/cms/media/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminMediaItem } from "@/lib/admin-media";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type ManagedMediaItem = AdminMediaItem & { usage: string[] };

const formatBytes = (bytes: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB` : "Unknown size";

export function MediaManager({ blobUploadsEnabled, items }: { blobUploadsEnabled: boolean; items: ManagedMediaItem[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [replaceID, setReplaceID] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [editingID, setEditingID] = useState<number | null>(null);
  const [editingAlt, setEditingAlt] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);

  function clearUpload() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
    setFile(null);
    setAlt("");
    setReplaceID(null);
    setProgress(0);
    if (fileInput.current) fileInput.current.value = "";
  }

  function chooseFile(nextFile: File | undefined) {
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) { setFeedback("Choose a PNG, JPEG, WebP, or AVIF image."); return; }
    if (nextFile.size > MAX_FILE_SIZE) { setFeedback("Images must be 10 MB or smaller."); return; }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(nextFile);
    setPreview(previewRef.current);
    setFile(nextFile);
    setFeedback("");
  }

  function replace(item: ManagedMediaItem) {
    setReplaceID(item.id);
    setAlt(item.alt);
    fileInput.current?.click();
  }

  async function submitUpload() {
    if (!file || !alt.trim()) { setFeedback("Choose an image and add alt text."); return; }
    setUploading(true);
    setFeedback("");
    try {
      const body = new FormData();
      body.set("_payload", JSON.stringify({ alt: alt.trim() }));
      if (blobUploadsEnabled) {
        const blob = await upload(file.name, file, {
          access: "public", clientPayload: "media", contentType: file.type,
          handleUploadUrl: "/api/vercel-blob-client-upload-route",
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        });
        body.set("file", JSON.stringify({ clientUploadContext: {}, collectionSlug: "media", filename: decodeURIComponent(blob.pathname.split("/").pop() || file.name), mimeType: file.type, size: file.size }));
      } else body.set("file", file);

      const response = await fetch(replaceID ? `/api/media/${replaceID}?depth=0` : "/api/media?depth=0", { body, credentials: "include", method: replaceID ? "PATCH" : "POST" });
      const result = (await response.json()) as { errors?: { message?: string }[]; message?: string };
      if (!response.ok) throw new Error(result.errors?.[0]?.message || result.message || "Upload failed.");
      setFeedback(replaceID ? "Image replaced." : "Image uploaded.");
      clearUpload();
      router.refresh();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function saveAlt(id: number) {
    startTransition(async () => {
      const result = await updateMediaAltAction(id, editingAlt);
      setFeedback(result.error || result.success || "");
      if (result.success) { setEditingID(null); router.refresh(); }
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      const result = await deleteMediaAction(id);
      setFeedback(result.error || result.success || "");
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4" aria-labelledby="media-upload-title">
        <div><h2 className="font-medium" id="media-upload-title">Upload image</h2><p className="mt-1 text-sm text-muted-foreground">PNG, JPEG, WebP, or AVIF. Maximum 10 MB.</p></div>
        <button className="flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => { setReplaceID(null); fileInput.current?.click(); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setReplaceID(null); chooseFile(event.dataTransfer.files[0]); }} type="button"><UploadCloud className="mb-2" />Drop an image here or choose a file</button>
        <input accept={ACCEPTED_TYPES.join(",")} className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} ref={fileInput} type="file" />
        {file && preview ? <div className="grid gap-4 rounded-2xl border bg-card p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-center"><div className="relative aspect-square overflow-hidden rounded-xl bg-muted"><Image alt="Upload preview" className="object-contain" fill sizes="112px" src={preview} unoptimized /></div><div className="space-y-2"><p className="truncate text-sm">{replaceID ? "Replacement: " : ""}{file.name}</p><Label htmlFor="media-alt">Alt text</Label><Input id="media-alt" maxLength={160} onChange={(event) => setAlt(event.target.value)} value={alt} /></div><Button aria-label="Cancel upload" disabled={uploading} onClick={clearUpload} size="icon" type="button" variant="ghost"><X /></Button><div className="sm:col-start-2"><Button disabled={uploading || !alt.trim()} onClick={submitUpload} type="button">{uploading ? <LoaderCircle className="animate-spin" /> : null}{uploading ? `Uploading ${progress}%` : replaceID ? "Replace image" : "Upload image"}</Button></div></div> : null}
      </section>

      <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground">{feedback}</p>

      {items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article className="overflow-hidden rounded-2xl border bg-card" key={item.id}><div className="relative aspect-[4/3] bg-muted"><Image alt={item.alt} className="object-contain p-4" fill sizes="(max-width: 639px) 100vw, 33vw" src={item.thumbnailURL} /></div><div className="space-y-4 p-4"><div><p className="truncate text-sm font-medium">{item.filename}</p><p className="mt-1 text-xs text-muted-foreground">{item.width} × {item.height} · {formatBytes(item.filesize)}</p></div>{editingID === item.id ? <div className="space-y-2"><Label htmlFor={`alt-${item.id}`}>Alt text</Label><Input id={`alt-${item.id}`} maxLength={160} onChange={(event) => setEditingAlt(event.target.value)} value={editingAlt} /><div className="flex gap-2"><Button disabled={pending || !editingAlt.trim()} onClick={() => saveAlt(item.id)} size="sm" type="button">Save</Button><Button onClick={() => setEditingID(null)} size="sm" type="button" variant="ghost">Cancel</Button></div></div> : <p className="text-sm text-muted-foreground">{item.alt}</p>}<div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">{item.usage.length ? <><p className="mb-1 font-medium text-foreground">Used by</p><ul className="space-y-1">{item.usage.map((usage) => <li key={usage}>{usage}</li>)}</ul></> : "Not currently referenced"}</div><div className="flex flex-wrap gap-1"><Button onClick={() => { setEditingID(item.id); setEditingAlt(item.alt); }} size="sm" type="button" variant="ghost"><Pencil />Alt text</Button><Button onClick={() => replace(item)} size="sm" type="button" variant="ghost"><RefreshCw />Replace</Button><AlertDialog><AlertDialogTrigger asChild><Button disabled={item.usage.length > 0 || pending} size="sm" type="button" variant="ghost"><Trash2 />Delete</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {item.filename}?</AlertDialogTitle><AlertDialogDescription>This permanently removes the file and all generated image sizes. This image is not referenced by products or settings.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => remove(item.id)}>Delete image</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></div></article>)}</div> : <div className="rounded-2xl border p-10 text-center text-sm text-muted-foreground"><ImagePlus className="mx-auto mb-3" />No images have been uploaded yet.</div>}
    </div>
  );
}
