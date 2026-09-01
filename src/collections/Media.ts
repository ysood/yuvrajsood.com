import path from "path";
import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  admin: {
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    displayPreview: true,
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif"],
    pasteURL: false,
  },
};
