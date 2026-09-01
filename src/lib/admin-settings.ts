import { cache } from "react";

import { getPayloadClient } from "@/lib/payload";
import type { User } from "@/payload-types";

export const getSiteSettings = cache(async (user: User) => {
  const payload = await getPayloadClient();
  return payload.findGlobal({ depth: 1, overrideAccess: false, slug: "site-settings", user });
});
