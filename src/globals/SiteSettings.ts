import type { GlobalConfig } from "payload";

import { authenticated } from "@/access/authenticated";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: "Settings",
  },
  fields: [
    {
      name: "profileImage",
      type: "upload",
      relationTo: "media",
    },
  ],
};
