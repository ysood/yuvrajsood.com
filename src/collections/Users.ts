import { Forbidden, type CollectionConfig } from "payload";

import { isConfiguredAdmin } from "@/access/authenticated";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: ({ req }) => isConfiguredAdmin(req.user),
    create: () => false,
    delete: () => false,
    read: ({ req }) => isConfiguredAdmin(req.user),
    update: ({ req }) => isConfiguredAdmin(req.user),
  },
  admin: {
    useAsTitle: "email",
  },
  auth: {
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    removeTokenFromResponses: true,
    tokenExpiration: 12 * 60 * 60,
  },
  fields: [],
  hooks: {
    beforeOperation: [
      ({ context, operation }) => {
        if (operation === "create" && context.adminCredentialBootstrap !== true) {
          throw new Forbidden();
        }
      },
    ],
  },
};
