import type { Media } from "@/payload-types";

export function getProductImageSource(image: Media) {
  const src = image.url;
  if (!src) return null;

  // Match the store ID that Payload's Vercel Blob adapter derives from its token.
  const storeId = process.env.BLOB_READ_WRITE_TOKEN?.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1];
  const mediaURL = URL.parse(src, "http://localhost");
  if (!storeId || process.env.STORAGE_VERCEL_BLOB_BASE_URL || !image.filename || !mediaURL?.pathname.startsWith("/api/media/file/")) {
    return { src };
  }

  const prefix = mediaURL.searchParams.get("prefix") ?? "";
  const path = [...prefix.split("/"), image.filename]
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .map(encodeURIComponent)
    .join("/");

  return {
    src: `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/${path}`,
    fallbackSrc: src,
  };
}
