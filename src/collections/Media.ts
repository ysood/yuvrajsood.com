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
    adminThumbnail: "small",
    staticDir: path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "small",
        width: 480,
        height: 480,
        fit: "contain",
        withoutEnlargement: true,
      },
      {
        name: "medium",
        width: 960,
        height: 960,
        fit: "contain",
        withoutEnlargement: true,
      },
      {
        name: "large",
        width: 1600,
        height: 1600,
        fit: "contain",
        withoutEnlargement: true,
      },
    ],
  },
};
