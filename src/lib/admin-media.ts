import type { Media } from "@/payload-types";

export type AdminMediaItem = {
  alt: string;
  filename: string;
  filesize: number;
  height: number;
  id: number;
  mimeType: string;
  thumbnailURL: string;
  url: string;
  width: number;
};

export function toAdminMediaItem(media: Media): AdminMediaItem | null {
  const thumbnailURL = media.sizes?.small?.url || media.url;
  if (!media.url || !thumbnailURL) return null;

  return {
    alt: media.alt,
    filename: media.filename || "Untitled image",
    filesize: media.filesize || 0,
    height: media.height || 0,
    id: media.id,
    mimeType: media.mimeType || "",
    thumbnailURL,
    url: media.url,
    width: media.width || 0,
  };
}
